import { BASE_VARIABLES, OCEAN_BREEZE_THEME } from "./themes";

export function getHTMLWrapper(
  html: string,
  title = "Untitled",
  theme_style?: string,
  frameId?: string
) {
  const finalTheme = theme_style || OCEAN_BREEZE_THEME;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>

  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet">

  <!-- Tailwind + Iconify -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            border: "var(--border)",
            input: "var(--input)",
            ring: "var(--ring)",
            background: "var(--background)",
            foreground: "var(--foreground)",
            primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
            secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
            destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
            muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
            accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
            popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
            card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
          }
        }
      }
    }
  </script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>


  <style type="text/tailwindcss">
    :root {${BASE_VARIABLES}${finalTheme}}
    *, *::before, *::after {margin:0;padding:0;box-sizing:border-box;}
    html, body {width:100%;min-height:100%;}
    body {font-family:var(--font-sans), "Cairo", sans-serif;background:var(--background);color:var(--foreground);-webkit-font-smoothing:antialiased;}
    #root {width:100%;min-height:100vh;}
    * {scrollbar-width:none;-ms-overflow-style:none;}
    *::-webkit-scrollbar {display:none;}
    .ai-target-hover { outline: 2px dashed #3b82f6 !important; outline-offset: 2px !important; cursor: crosshair !important; transition: outline 0.1s; }
  </style>
</head>
<body>
  <div id="root">
  <div class="relative">
    ${html}
  </div>
  <script>
    (()=>{
      const fid='${frameId}';
      const send=()=>{
        const r=document.getElementById('root')?.firstElementChild;
        const h=r?.className.match(/h-(screen|full)|min-h-screen/)?Math.max(800,innerHeight):Math.max(r?.scrollHeight||0,document.body.scrollHeight,800);
        parent.postMessage({type:'FRAME_HEIGHT',frameId:fid,height:h},'*');
      };
      setTimeout(send,100);
      setTimeout(send,500);
      
      // Targeted Component Editing Logic
      let isEditMode = false;
      let lastHovered = null;

      window.addEventListener('message', (event) => {
        if (event.data?.type === 'TOGGLE_EDIT_MODE') {
          isEditMode = event.data.isEditMode;
          if (!isEditMode && lastHovered) {
            lastHovered.classList.remove('ai-target-hover');
            lastHovered = null;
          }
        }
      });

      document.addEventListener('mouseover', (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        if (lastHovered) lastHovered.classList.remove('ai-target-hover');
        lastHovered = e.target;
        lastHovered.classList.add('ai-target-hover');
      });

      document.addEventListener('mouseout', (e) => {
        if (!isEditMode || !lastHovered) return;
        lastHovered.classList.remove('ai-target-hover');
      });

      document.addEventListener('click', (e) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        target.classList.remove('ai-target-hover');
        
        // 1. Mark the target exactly so Cheerio can find it on the server
        target.setAttribute('data-ai-target', 'true');
        
        // 2. Extract the HTML containing the marker
        const originalHtmlWithMarker = target.outerHTML;
        
        // 3. Clean up the DOM immediately so it doesn't affect rendering
        target.removeAttribute('data-ai-target');

        // Extract a readable name
        const tagName = target.tagName.toLowerCase();
        let name = tagName;
        if(target.id) name += '#' + target.id;
        else if (target.className && typeof target.className === 'string') {
          const classes = target.className.replace('ai-target-hover', '').trim().split(' ').slice(0, 2).join('.');
          if(classes) name += '.' + classes;
        }

        // Send back to parent 
        parent.postMessage({
          type: 'ELEMENT_SELECTED',
          frameId: fid,
          html: originalHtmlWithMarker,
          name: name
        }, '*');
        
        // Turn off edit mode automatically after selection
        isEditMode = false;
      }, { capture: true });

    })();
  </script>


</body>
</html>`;
}
