param([string]$BrowserPath, [string]$BaseUrl)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if ($BaseUrl) { $BaseUrl = $BaseUrl.TrimEnd('/') + '/' }
if (-not $BrowserPath) {
    $BrowserPath = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $BrowserPath) { throw 'Install Chrome or Edge, or supply -BrowserPath.' }
$profile = Join-Path $root ('.codex-preview/browser-' + [guid]::NewGuid().ToString('N'))
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:commandId = 0
$script:failures = [Collections.Generic.List[string]]::new()
$script:browserErrors = [Collections.Generic.List[string]]::new()
$script:checks = 0

function Send-Cdp($Method, $Parameters = @{}) {
    $script:commandId++
    $id = $script:commandId
    $json = @{ id = $id; method = $Method; params = $Parameters } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $null = $socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    while ($true) {
        $stream = [IO.MemoryStream]::new()
        $cancel = [Threading.CancellationTokenSource]::new(20000)
        try {
            do {
                $buffer = New-Object byte[] 65536
                $message = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cancel.Token).GetAwaiter().GetResult()
                if ($message.MessageType -eq [Net.WebSockets.WebSocketMessageType]::Close) { throw 'Browser disconnected.' }
                $stream.Write($buffer, 0, $message.Count)
            } while (-not $message.EndOfMessage)
            $payload = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
        } finally { $stream.Dispose(); $cancel.Dispose() }
        if ($payload.method -eq 'Runtime.exceptionThrown') { $script:browserErrors.Add(($payload.params | ConvertTo-Json -Depth 8 -Compress)) }
        if ($payload.method -eq 'Log.entryAdded' -and $payload.params.entry.level -eq 'error') { $script:browserErrors.Add($payload.params.entry.text) }
        if ($payload.id -eq $id) {
            if ($payload.error) { throw ($payload.error | ConvertTo-Json -Compress) }
            return $payload.result
        }
    }
}

function Invoke-Js($Expression) {
    $result = Send-Cdp 'Runtime.evaluate' @{ expression = $Expression; returnByValue = $true; awaitPromise = $true }
    if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 8) }
    return $result.result.value
}

function Open-Page($Path) {
    if ($BaseUrl) {
        $url = [uri]::new([uri]$BaseUrl, $Path).AbsoluteUri
    } else {
        $parts = $Path -split '\?', 2
        $url = ([uri](Join-Path $root ('docs/' + $parts[0]))).AbsoluteUri
        if ($parts.Count -gt 1) { $url += '?' + $parts[1] }
    }
    $navigation = Send-Cdp 'Page.navigate' @{ url = $url }
    if ($navigation.errorText) { throw $navigation.errorText }
    # Wait until the new document has replaced the previous execution context.
    for ($attempt = 0; $attempt -lt 100; $attempt++) {
        Start-Sleep -Milliseconds 100
        try {
            if (Invoke-Js ('location.href === ' + (ConvertTo-Json $url -Compress) + ' && document.readyState === "complete"')) { break }
        } catch { if ($attempt -eq 99) { throw } }
    }
    if ($attempt -eq 100) { throw "Page did not finish loading: $Path" }
    $null = Invoke-Js 'Promise.all([...document.images].map(i => { i.loading = "eager"; return i.decode().catch(() => {}); })).then(() => document.fonts.ready).then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))'
}

function Assert-Js($Name, $Expression) {
    $script:checks++
    if ((Invoke-Js $Expression) -ne $true) { $script:failures.Add($Name); Write-Host "FAIL $Name" }
}

function Set-Viewport($Width) {
    $null = Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $Width; height = 900; deviceScaleFactor = 1; mobile = $false }
}

try {
    $browser = Start-Process $BrowserPath -ArgumentList @('--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', ('--user-data-dir="' + $profile + '"'), 'about:blank') -WindowStyle Hidden -PassThru
    $portFile = Join-Path $profile 'DevToolsActivePort'
    for ($attempt = 0; $attempt -lt 100 -and -not (Test-Path -LiteralPath $portFile); $attempt++) { Start-Sleep -Milliseconds 100 }
    if (-not (Test-Path -LiteralPath $portFile)) { throw 'Browser debugging endpoint did not start.' }
    $port = (Get-Content -LiteralPath $portFile)[0]
    $tabs = Invoke-RestMethod "http://127.0.0.1:$port/json/list"
    $tab = $tabs | Where-Object type -eq 'page' | Select-Object -First 1
    $null = $socket.ConnectAsync([uri]$tab.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $null = Send-Cdp 'Runtime.enable'
    $null = Send-Cdp 'Log.enable'
    $null = Send-Cdp 'Page.enable'
    $null = Send-Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'no-preference' }) }

    foreach ($width in @(1440, 1280, 1101, 900, 600, 390, 320)) {
        Set-Viewport $width
        Open-Page 'index.html'
        Assert-Js "Home renders all projects at $width px" 'document.querySelectorAll(".project-card").length === window.portfolioProjects.length && window.portfolioProjects.length > 0'
        Assert-Js "Home stylesheet applies its colors and layout at $width px" 'getComputedStyle(document.body).backgroundColor==="rgb(245, 247, 243)" && getComputedStyle(document.querySelector(".project-list")).display==="grid" && getComputedStyle(document.querySelector(".project-card")).borderRadius==="12px"'
        Assert-Js "Drawing and GitHub projects have separate collections at $width px" 'document.querySelectorAll("#drawing-project-list .project-card").length===2 && document.querySelectorAll("#github-project-list .project-card").length===3 && ["cad-productivity-palette","revit-bim-inspector","drawing-file-organizer"].every(id=>!!document.querySelector("#github-project-list .project-card[data-project=\""+id+"\"]"))'
        Assert-Js "Drawing cards open the existing PDF detail at $width px" '[...document.querySelectorAll("#drawing-project-list .project-actions a")].every(a=>a.getAttribute("href").startsWith("projects/detail.html?project=")&&!a.hasAttribute("target"))'
        Assert-Js "Drawing thumbnails are accessible links to their matching detail at $width px" '[...document.querySelectorAll("#drawing-project-list .project-card")].every(card=>{const a=card.querySelector("a.project-card-visual");return a&&a.href===card.querySelector(".project-actions a").href&&a.getAttribute("aria-label").includes(card.querySelector("h4").textContent)&&!a.hasAttribute("target");})'
        Assert-Js "GitHub cards link directly to their README at $width px" '[...document.querySelectorAll("#github-project-list .project-card")].every(card=>{const p=window.portfolioProjects.find(p=>p.id===card.dataset.project),a=card.querySelector(".repository-link");return a.href===p.readmeUrl&&a.target==="_blank"&&a.rel.includes("noopener")&&a.rel.includes("noreferrer")&&card.querySelectorAll("a").length===1;})'
        Assert-Js "Primary projects show metadata and technology tags at $width px" '[...document.querySelectorAll(".project-collection--primary .project-card")].every(card=>card.querySelectorAll(".project-card-meta > div").length===2&&card.querySelectorAll(".project-tools li").length>0)'
        Assert-Js "Architecture is primary and development stays compact at $width px" 'document.body.dataset.focus==="architecture" && document.querySelector(".project-collection").querySelector("#drawing-project-list")!==null && document.querySelectorAll("#github-project-list .project-card--supporting").length===3 && !document.querySelector("#github-project-list .project-card-visual, #planned-project-list")'
        Assert-Js "All architecture documents have direct preview links at $width px" 'document.querySelectorAll(".drawing-document-link").length===5 && [...document.querySelectorAll(".drawing-document-link")].every(a=>new URL(a.href).searchParams.has("document"))'
        Assert-Js "Project thumbnails remain compact at $width px" '[...document.querySelectorAll(".project-card-visual")].every(el=>el.getBoundingClientRect().height<=300)&&[...document.querySelectorAll("#github-project-list .project-card-visual")].every(el=>el.getBoundingClientRect().height<=220)'
        Assert-Js "Home images load at $width px" '[...document.images].every(i => i.complete && i.naturalWidth > 0)'
        Assert-Js "Cafe uses its isometric project thumbnail at $width px" 'document.querySelector("[data-project=\"comic-cafe\"] .project-card-visual img").getAttribute("src") === window.portfolioProjects[0].thumbnail'
        Assert-Js "Home fits viewport at $width px" 'document.documentElement.scrollWidth <= innerWidth'
        Assert-Js "Header scroll offset matches height at $width px" 'Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) - document.querySelector("header").getBoundingClientRect().height) < 1'
        Assert-Js "Interior precedes CAD at $width px" 'document.querySelectorAll(".project-card")[0].dataset.project === "comic-cafe" && document.querySelectorAll(".project-card")[1].dataset.project === "two-story-house"'
        Assert-Js "Pending video does not create an empty player at $width px" '!document.querySelector("video") && !document.querySelector(".video-toggle")'
        Assert-Js "Home uses native scrolling and shows content immediately at $width px" 'getComputedStyle(document.documentElement).scrollBehavior==="auto" && getComputedStyle(document.documentElement).scrollSnapType==="none" && [...document.querySelectorAll(".project-card, .about-grid")].every(el=>getComputedStyle(el).opacity==="1" && getComputedStyle(el).transform==="none")'
    }

    foreach ($width in @(1440, 390)) {
        Set-Viewport $width
        foreach ($project in @('comic-cafe', 'two-story-house')) {
            Open-Page 'index.html'
            $point = Invoke-Js ('(()=>{const a=document.querySelector("[data-project=\"' + $project + '\"] a.project-card-visual");a.scrollIntoView({block:"center"});const b=a.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2};})()')
            $null = Send-Cdp 'Input.dispatchMouseEvent' @{ type = 'mousePressed'; x = $point.x; y = $point.y; button = 'left'; clickCount = 1 }
            $null = Send-Cdp 'Input.dispatchMouseEvent' @{ type = 'mouseReleased'; x = $point.x; y = $point.y; button = 'left'; clickCount = 1 }
            $loaded = 'location.pathname.endsWith("/projects/detail.html") && new URLSearchParams(location.search).get("project")==="' + $project + '" && document.readyState==="complete" && !!document.querySelector(".pdf-frame[src]")'
            for ($attempt = 0; $attempt -lt 100; $attempt++) {
                Start-Sleep -Milliseconds 100
                try { if (Invoke-Js $loaded) { break } } catch { if ($attempt -eq 99) { throw } }
            }
            Assert-Js "Clicking the $project thumbnail opens its PDF detail at $width px" $loaded
        }
    }

    Set-Viewport 1440
    Open-Page 'index.html'
    Assert-Js 'Wheel scrolling is not intercepted' '(() => { const event=new WheelEvent("wheel",{deltaY:180,bubbles:true,cancelable:true});window.dispatchEvent(event);return !event.defaultPrevented; })()'
    foreach ($modifier in @('ctrlKey', 'metaKey', 'shiftKey', 'altKey')) {
        Assert-Js "Modified navigation click preserves browser action: $modifier" ('(() => { const a = document.querySelector(".site-header nav a[href=\"#top\"]"); let intercepted; document.addEventListener("click", e => {intercepted=e.defaultPrevented;e.preventDefault();}, {once:true}); a.dispatchEvent(new MouseEvent("click", {bubbles:true,cancelable:true,' + $modifier + ':true})); return intercepted === false; })()')
    }
    Open-Page 'index.html'
    Assert-Js 'Clicking top at the top updates the URL' 'document.querySelector(".wordmark").click(); location.hash === "#top"'
    Assert-Js 'Introduction navigation reaches the profile section without animation' 'document.querySelector(".site-header nav a[href=\"#top\"]").click();new Promise(r=>requestAnimationFrame(()=>r(location.hash === "#top" && Math.abs(document.querySelector(".hero").getBoundingClientRect().top-document.querySelector("header").getBoundingClientRect().bottom)<2)))'
    Assert-Js 'Navigation initially marks the introduction' 'document.querySelector("nav a[aria-current=\"location\"]").hash==="#top"'
    Assert-Js 'Project navigation updates the active menu and reading progress' 'document.querySelector("nav a[href=\"#work\"]").click();new Promise(r=>setTimeout(()=>r(document.querySelector("nav a[aria-current=\"location\"]").hash==="#work" && document.querySelector(".reading-progress").style.transform!=="scaleX(0)"),150))'
    Assert-Js 'Contact stays active at the end of the page' 'document.querySelector("nav a[href=\"#contact\"]").click();new Promise(r=>setTimeout(()=>r(document.querySelector("nav a[aria-current=\"location\"]").hash==="#contact" && document.querySelector(".reading-progress").style.transform==="scaleX(1)"),150))'
    $null = Invoke-Js 'document.querySelector(".isometric-preview").scrollIntoView({block:"center"});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'
    Assert-Js 'Mouse movement drives the thumbnail effect' '(()=>{const el=document.querySelector(".isometric-preview"),b=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent("pointermove",{pointerType:"mouse",bubbles:true,clientX:b.left+b.width*.8,clientY:b.top+b.height*.3}));return new Promise(r=>requestAnimationFrame(()=>r(el.classList.contains("is-pointer-active")&&parseFloat(el.style.getPropertyValue("--tilt-y"))>0)));})()'
    Assert-Js 'Leaving a thumbnail clears its pointer effect' '(()=>{const el=document.querySelector(".isometric-preview");el.dispatchEvent(new PointerEvent("pointerleave"));return !el.classList.contains("is-pointer-active")&&!el.style.getPropertyValue("--tilt-y");})()'
    $null = Invoke-Js 'document.querySelector("[data-project=\"comic-cafe\"] .drawing-document-link").focus()'
    $null = Send-Cdp 'Input.dispatchKeyEvent' @{ type = 'keyDown'; key = 'Tab'; code = 'Tab'; windowsVirtualKeyCode = 9; modifiers = 8 }
    $null = Send-Cdp 'Input.dispatchKeyEvent' @{ type = 'keyUp'; key = 'Tab'; code = 'Tab'; windowsVirtualKeyCode = 9; modifiers = 8 }
    Assert-Js 'Isometric thumbnail responds to keyboard focus' 'new Promise(r=>setTimeout(()=>r(document.activeElement.matches("a.project-card-visual") && getComputedStyle(document.activeElement).outlineStyle!=="none" && getComputedStyle(document.querySelector(".isometric-preview img")).transform!=="none" && getComputedStyle(document.querySelector(".isometric-preview"),"::after").opacity==="1"),1150))'
    $null = Send-Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) }
    Assert-Js 'Reduced motion disables thumbnail motion' 'new Promise(r=>requestAnimationFrame(()=>r(getComputedStyle(document.querySelector(".isometric-preview img")).transform==="none" && getComputedStyle(document.querySelector(".isometric-preview"),"::after").opacity==="0")))'
    Assert-Js 'Reduced motion prevents JavaScript pointer effects' '(()=>{const el=document.querySelector(".isometric-preview");el.dispatchEvent(new PointerEvent("pointermove",{pointerType:"mouse",bubbles:true,clientX:300,clientY:300}));return new Promise(r=>requestAnimationFrame(()=>r(!el.classList.contains("is-pointer-active")&&!el.style.getPropertyValue("--tilt-y"))));})()'
    $null = Send-Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'no-preference' }) }

    foreach ($width in @(1440, 390)) {
        Set-Viewport $width
        foreach ($project in @('two-story-house', 'comic-cafe', 'cad-productivity-palette', 'revit-bim-inspector', 'drawing-file-organizer')) {
            Open-Page ('projects/detail.html?project=' + $project)
            Assert-Js "Detail renders $project at $width px" 'document.querySelector("h1").textContent === window.portfolioProjects.find(p => p.id === new URLSearchParams(location.search).get("project")).title'
            Assert-Js "Detail fits viewport: $project at $width px" 'document.documentElement.scrollWidth <= innerWidth'
            if ($project -in @('cad-productivity-palette', 'revit-bim-inspector', 'drawing-file-organizer')) {
                Assert-Js "Development detail links to the correct repository: $project at $width px" 'document.querySelector(".detail-heading a").href===window.portfolioProjects.find(p=>p.id===new URLSearchParams(location.search).get("project")).url && document.querySelectorAll(".development-detail li").length===3'
            }
            if ($project -eq 'comic-cafe') {
                Assert-Js "Cafe lists all four PDFs in the same navigation at $width px" 'document.querySelectorAll(".document-list .document-row").length === 4 && !document.querySelector(".document-row.is-pending")'
                Assert-Js "Cafe detail has no separate video or upcoming sections at $width px" '!document.querySelector("#isometric, .upcoming-section, .isometric-stage, video")'
                Assert-Js "Available PDF loads initially at $width px" '!document.querySelector("iframe").getAttribute("src").includes("null")'
                Assert-Js "PDF next selects drawings at $width px" 'document.querySelectorAll(".toolbar-button")[1].click();document.querySelector("iframe").getAttribute("src").includes("comic-cafe-drawings.pdf") && new URLSearchParams(location.search).get("document") === "comic-cafe-drawings" && !document.querySelectorAll(".toolbar-button")[1].disabled && document.querySelector("a[download]").getAttribute("download") === "comic-cafe-drawings.pdf"'
                Assert-Js "PDF previous selects proposal at $width px" 'document.querySelectorAll(".toolbar-button")[0].click();document.querySelector("iframe").getAttribute("src").includes("comic-cafe-proposal.pdf") && document.querySelectorAll(".toolbar-button")[0].disabled && document.querySelectorAll(".document-row")[0].getAttribute("aria-current") === "true"'
                Assert-Js "Third PDF opens coloring with original and download links at $width px" 'document.querySelectorAll(".document-row")[2].click();window.testFrame=document.querySelector("iframe");window.testItem=window.portfolioProjects[0].documents[2];window.testFrame.getAttribute("src").startsWith("../"+window.testItem.file+"#page=1") && document.querySelector(".pdf-title").textContent===window.testItem.title && document.querySelectorAll(".document-row")[2].getAttribute("aria-current")==="true" && [...document.querySelectorAll(".pdf-toolbar a")].every(a=>a.getAttribute("href")==="../"+window.testItem.file && !a.hidden) && document.querySelector("a[download]").getAttribute("download")===window.testItem.file.split("/").pop()'
                Assert-Js "Fourth PDF opens renderings in the same viewer at $width px" 'document.querySelectorAll(".document-row")[3].click();window.testItem=window.portfolioProjects[0].documents[3];document.querySelector("iframe")===window.testFrame && window.testFrame.getAttribute("src").startsWith("../"+window.testItem.file+"#page=1") && document.querySelector(".pdf-title").textContent===window.testItem.title && document.querySelectorAll(".toolbar-button")[1].disabled && [...document.querySelectorAll(".pdf-toolbar a")].every(a=>a.getAttribute("href")==="../"+window.testItem.file && !a.hidden) && document.querySelector("a[download]").getAttribute("download")===window.testItem.file.split("/").pop()'
                Assert-Js "Returning to an available PDF restores the viewer and download at $width px" 'document.querySelectorAll(".document-row")[0].click();!!document.querySelector("iframe") && !document.querySelector(".pdf-pending-state") && !document.querySelector("a[download]").hidden'
            }
        }
        Open-Page 'projects/detail.html?project=comic-cafe&document=comic-cafe-drawings'
        Assert-Js "PDF deep link selects requested document at $width px" 'document.querySelector("iframe").getAttribute("src").includes("comic-cafe-drawings.pdf")'
        Open-Page 'projects/detail.html?project=comic-cafe&document=comic-cafe-coloring'
        Assert-Js "Coloring PDF deep link selects the third row at $width px" '!document.querySelector(".pdf-pending-state") && document.querySelectorAll(".document-row")[2].getAttribute("aria-current") === "true" && document.querySelector("iframe").getAttribute("src").startsWith("../"+window.portfolioProjects[0].documents[2].file+"#page=1")'
        Open-Page 'projects/detail.html?project=comic-cafe&document=comic-cafe-sketchup-renderings'
        Assert-Js "Rendering PDF deep link selects the fourth row at $width px" 'document.querySelectorAll(".document-row")[3].getAttribute("aria-current") === "true" && document.querySelector("iframe").getAttribute("src").startsWith("../"+window.portfolioProjects[0].documents[3].file+"#page=1")'
        Open-Page 'projects/detail.html?project=invalid'
        Assert-Js "Unknown project offers a return link at $width px" '!!document.querySelector("#project-detail h1") && !!document.querySelector("#project-detail a[href=\"../index.html#work\"]") && !document.querySelector("iframe")'
    }

    # Keep coverage for future documents that have not been supplied yet.
    $fixture = Send-Cdp 'Page.addScriptToEvaluateOnNewDocument' @{ source = '(() => { let data; Object.defineProperty(window, "portfolioProjects", {configurable:true, get:()=>data, set:projects=>{ data=projects; const cafe=projects.find(p=>p.id==="comic-cafe"); cafe.documents[2].file=null; cafe.documents[3].file=null; }}); })();' }
    Open-Page 'projects/detail.html?project=comic-cafe&document=comic-cafe-coloring'
    Assert-Js 'Missing third PDF shows a pending state in its existing navigation row' 'document.querySelectorAll(".document-row").length===4 && document.querySelectorAll(".document-row.is-pending").length===2 && !!document.querySelector(".pdf-pending-state") && !document.querySelector("iframe") && !document.querySelector(".pdf-toolbar a[href]")'
    Assert-Js 'Missing fourth PDF keeps the pending state in the same viewer' 'document.querySelectorAll(".document-row")[3].click();!!document.querySelector(".pdf-pending-state") && document.querySelectorAll(".document-row")[3].getAttribute("aria-current")==="true" && document.querySelectorAll(".toolbar-button")[1].disabled'
    Assert-Js 'Available PDF restores the iframe after a pending document' 'document.querySelectorAll(".document-row")[0].click();document.querySelector("iframe").getAttribute("src").includes("comic-cafe-proposal.pdf") && !document.querySelector(".pdf-pending-state") && !document.querySelector("a[download]").hidden'
    $null = Send-Cdp 'Page.removeScriptToEvaluateOnNewDocument' @{ identifier = $fixture.identifier }

    # Record a small synthetic clip so hover playback is tested without the user's footage.
    $videoBytes = Invoke-Js 'new Promise((resolve,reject)=>{const canvas=document.createElement("canvas");canvas.width=96;canvas.height=96;const context=canvas.getContext("2d");context.fillStyle="#526d5b";context.fillRect(0,0,96,96);const stream=canvas.captureStream(12);const recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp8"});const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);recorder.onerror=reject;recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(",")[1]);reader.onerror=reject;reader.readAsDataURL(new Blob(chunks,{type:recorder.mimeType}));};recorder.start();setTimeout(()=>{context.fillStyle="#dce6dd";context.fillRect(0,0,48,96);},100);setTimeout(()=>recorder.stop(),500);})'
    if ($BaseUrl) {
        $videoRelative = 'data:video/webm;base64,' + $videoBytes
    } else {
        [IO.File]::WriteAllBytes((Join-Path $profile 'rotation-test.webm'), [Convert]::FromBase64String($videoBytes))
        $videoRelative = '../.codex-preview/' + (Split-Path $profile -Leaf) + '/rotation-test.webm'
    }
    $videoSource = '(() => { let data; Object.defineProperty(window, "portfolioProjects", {configurable:true, get:()=>data, set:projects=>{data=projects; projects.find(p=>p.id==="comic-cafe").video.file=' + (ConvertTo-Json $videoRelative -Compress) + ';}}); })();'
    $fixture = Send-Cdp 'Page.addScriptToEvaluateOnNewDocument' @{ source = $videoSource }
    Set-Viewport 1440
    Open-Page 'index.html'
    $null = Invoke-Js 'document.querySelector("[data-project=\"comic-cafe\"]").scrollIntoView({behavior:"instant"});new Promise(r=>setTimeout(r,100))'
    Assert-Js 'Video is mounted in the cafe thumbnail only' 'document.querySelectorAll("video").length===1 && !!document.querySelector("[data-project=\"comic-cafe\"] .project-card-visual video")'
    Assert-Js 'Compact thumbnail keeps the video control visible' '(()=>{const b=document.querySelector(".video-toggle").getBoundingClientRect(),p=document.querySelector(".isometric-stage").parentElement.getBoundingClientRect();return b.bottom<=p.bottom&&b.top>=p.top&&b.right<=p.right;})()'
    Assert-Js 'Video loads and waits for interaction' 'new Promise(r=>{const v=document.querySelector("video");if(v.readyState>=1)r(v.paused);else {v.addEventListener("loadedmetadata",()=>r(v.paused),{once:true});v.addEventListener("error",()=>r(false),{once:true});}})'
    Assert-Js 'Hover plays muted looping video at half speed' 'document.querySelector(".isometric-stage").dispatchEvent(new PointerEvent("pointerenter"));new Promise(r=>setTimeout(()=>{const v=document.querySelector("video");r(!v.paused && v.muted && v.loop && v.playsInline && v.playbackRate===0.5 && document.querySelector(".video-toggle").getAttribute("aria-pressed")==="true");},200))'
    Assert-Js 'Leaving the video pauses playback' 'document.querySelector(".isometric-stage").dispatchEvent(new PointerEvent("pointerleave"));document.querySelector("video").paused && document.querySelector(".video-toggle").getAttribute("aria-pressed")==="false"'
    $null = Send-Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{name='prefers-reduced-motion';value='reduce'}) }
    Assert-Js 'Reduced motion prevents hover playback' 'new Promise(r=>setTimeout(()=>{document.querySelector(".isometric-stage").dispatchEvent(new PointerEvent("pointerenter"));setTimeout(()=>r(document.querySelector("video").paused),100);},100))'
    Assert-Js 'Play button works with reduced motion' 'document.querySelector(".video-toggle").click();new Promise(r=>setTimeout(()=>r(!document.querySelector("video").paused),150))'
    Assert-Js 'Pause button stops playback' 'document.querySelector(".video-toggle").click();document.querySelector("video").paused'
    $null = Send-Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{name='prefers-reduced-motion';value='no-preference'}) }
    Set-Viewport 390
    Open-Page 'index.html'
    $null = Invoke-Js 'document.querySelector("[data-project=\"comic-cafe\"]").scrollIntoView({behavior:"instant"});new Promise(r=>setTimeout(r,100))'
    Assert-Js 'Mobile video fits the viewport' 'document.documentElement.scrollWidth <= innerWidth && !!document.querySelector(".video-toggle")'
    Assert-Js 'Mobile thumbnail keeps the video control visible' '(()=>{const b=document.querySelector(".video-toggle").getBoundingClientRect(),p=document.querySelector(".isometric-stage").parentElement.getBoundingClientRect();return b.bottom<=p.bottom&&b.top>=p.top&&b.right<=p.right;})()'
    Assert-Js 'Mobile play button starts video' 'document.querySelector(".video-toggle").click();new Promise(r=>setTimeout(()=>r(!document.querySelector("video").paused),200))'
    Open-Page 'projects/detail.html?project=comic-cafe'
    Assert-Js 'Even a connected video stays out of the project detail' '!document.querySelector("video, .isometric-stage")'
    $null = Send-Cdp 'Page.removeScriptToEvaluateOnNewDocument' @{ identifier = $fixture.identifier }
    foreach ($width in @(1440,390)) {
        Set-Viewport $width
        Open-Page 'index.html'
        $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; captureBeyondViewport = $true }
        [IO.File]::WriteAllBytes((Join-Path $root ('.codex-preview/home-' + $width + '.png')), [Convert]::FromBase64String($shot.data))
        $null = Invoke-Js 'document.querySelector("#work").scrollIntoView();new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'
        $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png' }
        [IO.File]::WriteAllBytes((Join-Path $root ('.codex-preview/work-' + $width + '.png')), [Convert]::FromBase64String($shot.data))
    }
    if ($script:browserErrors.Count) { $script:failures.Add(($script:browserErrors -join '; ')) }
    if ($script:failures.Count) { throw "$($script:failures.Count) browser checks failed: $($script:failures -join '; ')" }
    Write-Host "Passed $($script:checks) browser checks with no browser errors."
} finally {
    $socket.Dispose()
    if ($browser -and -not $browser.HasExited) { Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue }
}
