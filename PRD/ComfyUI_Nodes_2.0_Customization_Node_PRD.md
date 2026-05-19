# **Product Requirements Document: Typographical and Thematic Control Panel for ComfyUI Nodes 2.0**

## **Executive Summary**

The fundamental architecture of the ComfyUI frontend has recently undergone a transformative migration, transitioning from the legacy LiteGraph.js Canvas rendering engine to a highly reactive, Vue-based Document Object Model (DOM) rendering system known as Nodes 2.0.1 This architectural pivot was necessitated by the inherent development bottlenecks of the legacy canvas system, where even trivial user interface alterations required complex mathematical recalculations and deep graphical modifications.1 The new Vue-based framework unlocks accelerated feature iteration, richer dynamic interactions, and the ability to integrate advanced web-standard components directly over the graph space.1 However, this paradigm shift implies that established methods for node design, widget injection, and aesthetic customization are no longer directly applicable. Extension developers must now navigate a sophisticated interplay between the underlying execution graph, the Vue component lifecycle, and dynamic CSS injection.2

This Product Requirements Document establishes the comprehensive architectural blueprints, functional specifications, and implementation pathways for a new "Control Panel" Custom Node designed explicitly for the Nodes 2.0 ecosystem. Diverging from traditional execution nodes that process tensors, latent spaces, or image batches, this custom node functions entirely as an environmental interface. It operates with strictly zero inputs and zero outputs, existing upon the canvas as a persistent, localized dashboard.4 The primary utility of this control panel is to grant users granular, real-time authority over the typographical and thematic styling of their active workflow environment.

The feature set mandated by this document includes the capacity to dynamically scale font sizes for specifically targeted sectors of the node interface—such as structural titles, operational text areas, and standard body text—bypassing the global limitations of standard canvas scaling.6 Furthermore, the interface will provide robust color selection mechanisms via integrated DOM-based color pickers, allowing precise manipulation of font colors, node backgrounds, header title backgrounds, and peripheral outlines. Outline styling is intentionally constrained to a single stable outline-color behavior rather than selectable animated effect modes. Crucially, the system architecture dictates the implementation of a dedicated local directory for custom typographical assets, allowing users to physically store custom font files that the node will seamlessly parse, serve, and render selectable within the interface.7 By explicitly defining all backend Python routing, frontend Vue interactions, asset delivery mechanisms, and state serialization protocols, this document serves as a definitive, exhaustive guide designed to empower automated coding agents to execute the implementation with maximal efficiency and zero preliminary analytical overhead.

## **Architectural Paradigm and the Nodes 2.0 Ecosystem**

Understanding the technical delta between the legacy LiteGraph system and the Nodes 2.0 architecture is paramount for the successful deployment of this custom control panel. In the legacy environment, nodes were drawn utilizing HTML5 Canvas 2D API contexts; text, shapes, and colors were mathematically plotted and painted pixel by pixel during every render cycle.1 Modifying the color of a specific text string or the border of a node required hijacking the onDrawBackground or onDrawForeground lifecycle hooks and injecting low-level drawing commands.8

The Nodes 2.0 system replaces this pixel-painting methodology with a DOM-overlay architecture. While the underlying graph logic and connection routing remain tethered to the core ComfyUI application state, the visual representation of the nodes is now governed by Vue.js components.1 Nodes are rendered as standard HTML elements (\<div\>, \<header\>, \<textarea\>, etc.), structured by a hierarchical DOM tree, and styled via cascading stylesheets (CSS) utilizing CSS variables (custom properties).1 PrimeVue, a comprehensive UI component library, is heavily utilized within this new frontend to construct standardized elements, though its lazy-loading CSS injection strategies require careful circumvention when introducing custom styling.10

Because the intended control panel must manipulate the visual aesthetics of these Vue components globally or locally, the extension must operate as an intermediary style injector. The control panel will not draw pixels; instead, it will instantiate native HTML \<input\> elements (range sliders and color pickers) via the addDOMWidget API.11 As the user interacts with these widgets, the frontend JavaScript logic will intercept the data, update the node's internal state to ensure workflow persistence, and dynamically construct a formatted block of CSS rules. This CSS block is then injected into the \<head\> of the ComfyUI document, targeting specific CSS classes associated with the Nodes 2.0 architecture to force visual reflows across the graph environment. Furthermore, because Nodes 2.0 maintains a separation between the visual Vue components and the underlying widgetValueStore, special care must be taken to ensure that DOM-based inputs synchronize flawlessly with the state management system, preventing data loss upon page reloads.13

## **System Directory and File Path Blueprint**

To ensure that an automated coding agent can seamlessly construct the extension without structural ambiguity, the repository must be strictly organized. ComfyUI enforces specific discovery protocols for custom nodes; Python backend files are parsed during server initialization, while frontend JavaScript files are delivered to the client browser based on explicitly declared web directories.14 The following table maps the requisite file structure, defining the exact placement and functional mandate for every component of the application.

| Absolute Path Relative to Extension Root | File or Directory Name | Functional Mandate and System Purpose |
| :---- | :---- | :---- |
| / | \_\_init\_\_.py | The primary execution entry point for the ComfyUI backend. It must import the node class definitions, register them within the NODE\_CLASS\_MAPPINGS dictionary, and export the WEB\_DIRECTORY variable to map the frontend assets.15 |
| / | theme\_control\_node.py | Contains the Python class defining the Control Panel node. It establishes the zero-input/zero-output signature using empty tuples and hidden ID parameters, satisfying the backend graph validation engine.4 |
| / | asset\_server\_routes.py | Defines the asynchronous aiohttp endpoints utilizing the @PromptServer.instance.routes decorator. Responsible for exposing the local font directory as a static web route and providing a JSON-formatted list of available typographical assets.17 |
| /fonts/ | *(Directory)* | The dedicated physical storage location on the host machine for custom font files (.ttf, .otf, .woff2). The backend initialization script must verify its existence and create it if missing. |
| /web/ | extension\_bootstrap.js | The client-side entry point. Invokes app.registerExtension(), hooks into the nodeCreated lifecycle event, and identifies when the specific Control Panel node is instantiated on the canvas.15 |
| /web/ | dom\_widget\_factory.js | Encapsulates the logic for constructing complex HTML user interfaces. Leverages node.addDOMWidget() to inject color pickers, range sliders, and dropdown menus into the node's bounding box.11 |
| /web/ | typography\_manager.js | Interfaces with the CSS Font Loading API (FontFace). Responsible for fetching the list of fonts from the backend API, asynchronously downloading the font binaries, and adding them to the browser's document registry.20 |
| /web/ | css\_style\_injector.js | The thematic engine. Observes state changes from the DOM widgets, compiles the targeted CSS rules utilizing Nodes 2.0 specific classes, and injects the resulting stylesheet into the browser's DOM head.6 |

This strict segregation of duties guarantees that the backend remains exclusively focused on filesystem operations and graph validation, while the frontend independently manages the reactive visual layer, adhering perfectly to the Nodes 2.0 design philosophy.1

## **Backend Architecture: Stateless Execution and Routing**

The backend implementation within the ComfyUI server environment is inherently lightweight for this specific node, yet it must adhere rigorously to the API standards to prevent application instability. The backend serves two disparate functions: registering a valid node class that the execution graph can recognize, and circumventing standard static file restrictions to serve custom font binaries directly from the extension folder.

### **Node Registration and Zero-IO Protocol**

In a standard ComfyUI workflow, nodes act as sequential processors, receiving inputs, executing transformations, and passing outputs.14 The Control Panel defies this convention; it must exist on the canvas purely for user interaction. To achieve a zero-input, zero-output footprint, the theme\_control\_node.py file must define a class (e.g., ThemeControlPanelNode) with specific class methods.

The @classmethod def INPUT\_TYPES(s) function must return a dictionary. Within this dictionary, the required key must be mapped to an empty dictionary {}, indicating that no visual connection slots should be generated on the left side of the node. However, to facilitate communication between the frontend interface and the backend state (particularly for saving the node's parameters within the workflow), the hidden key must be utilized. The hidden dictionary must request the unique identifier of the node by setting "unique\_id": "UNIQUE\_ID".16 This ensures that the frontend can accurately target this specific node instance when pushing state updates.

Similarly, the RETURN\_TYPES constant must be defined as an empty tuple ().4 If a node possesses exactly one output, Python syntax requires a trailing comma (e.g., ("IMAGE",)), but for zero outputs, the empty parentheses are mandatory.4 This prevents the generation of output slots on the right side of the node. The FUNCTION constant must point to a defined execution method within the class. To satisfy the execution engine during a workflow queue, this method must simply accept the kwargs and return an empty dictionary or an empty tuple, ensuring the pipeline continues processing without attempting to extract non-existent data from the Control Panel.

The \_\_init\_\_.py file binds this logic by importing the class and appending it to the NODE\_CLASS\_MAPPINGS. Crucially, it must also define WEB\_DIRECTORY \= "./web" to instruct the ComfyUI server to automatically serve all JavaScript files located in that directory to the client browser upon application load.15

### **Asset Delivery and Asynchronous API Routing**

A core requirement of this PRD is the inclusion of a dedicated folder where users can store custom fonts that become selectable within the node interface. Standard ComfyUI security policies strictly prohibit the frontend from arbitrarily reading files from the host machine's disk.24 Therefore, the extension must establish custom HTTP routes utilizing the aiohttp framework that underpins the ComfyUI server.17

Within the asset\_server\_routes.py file, the coding agent must import the PromptServer instance and the web module from aiohttp.17 The first necessary route is a static file server. The script must dynamically determine the absolute path of the /fonts/ directory relative to the extension's installation location. It must then invoke PromptServer.instance.app.add\_routes(\[web.static('/custom\_theme\_fonts', path\_to\_fonts)\]).18 This effectively mounts the local directory to the web server, allowing the browser to fetch font files via URLs corresponding to the /custom\_theme\_fonts/ prefix.

The second required route is a discovery endpoint. The frontend requires a mechanism to know which fonts are currently residing in the /fonts/ folder. The backend must define a GET endpoint, for example, @PromptServer.instance.routes.get('/api/theme\_panel/fonts').17 When this endpoint is hit by a client request, the asynchronous function must utilize Python's os.walk or pathlib libraries to scan the /fonts/ directory. It must filter the results to include only valid typographical extensions, specifically .ttf, .otf, .woff, and .woff2.

A critical security constraint must be implemented during this filesystem traversal. Path traversal vulnerabilities are highly prevalent in custom extensions, potentially allowing malicious actors to read arbitrary files from the server's root directory.24 The coding agent must implement strict path normalization using os.path.abspath and os.path.commonprefix to definitively assert that every discovered file mathematically resides within the intended bounds of the /fonts/ directory before appending it to the response payload. The endpoint must then serialize the list of discovered fonts into a JSON response containing the filename, a synthesized CSS font-family name (e.g., stripping the extension and sanitizing spaces), and the corresponding static web URL.

## **Frontend Engineering: Vue Integration and DOM Manipulation**

The frontend architecture represents the majority of the computational complexity for this extension. The transition to Nodes 2.0 means that the control panel cannot rely on legacy canvas draw() overrides to render its interface. Instead, it must inject native HTML elements into the DOM layer hovering above the canvas, ensuring that these elements scale, pan, and interact correctly within the Vue-based environment.1

### **Extension Registration and the Component Lifecycle**

The extension\_bootstrap.js file initiates the client-side logic. It imports the global app object and executes app.registerExtension({}).14 The extension must define a unique name attribute to prevent namespace collisions. The critical integration point is the nodeCreated(node, app) asynchronous lifecycle hook.19 This hook fires every time a node is instantiated on the canvas, whether by the user adding it manually or the system loading it from a saved workflow JSON.

Within nodeCreated, the code must verify if node.comfyClass matches the backend identifier for the Control Panel. Upon a positive match, the script must execute initialization protocols. First, it should override the node's default dimensions, as a control panel requires significantly more horizontal and vertical real estate than standard execution nodes. Following structural adjustments, the script delegates the construction of the user interface to the dom\_widget\_factory.js module.

### **DOM Widget Factory and Reactive Interfaces**

Under the legacy system, node.addWidget() was utilized to create simple numerical or string inputs rendered directly onto the HTML5 canvas.11 For advanced interfaces like color pickers and custom dropdowns required by this PRD, the extension must utilize the node.addDOMWidget(name, type, element, options) API.11 This function bridges standard HTML elements with the node's internal state mechanism.

The dom\_widget\_factory.js must construct a primary HTML \<div\> container. To ensure the interface aligns with the modern aesthetic of Nodes 2.0, this container should utilize CSS Grid or Flexbox layouts, dynamically organizing the various required controls into a cohesive, user-friendly dashboard.1

The functional requirements dictate the creation of several specific HTML elements:

1. **Sectional Font Size Controls**: Multiple \<input type="range"\> sliders must be created to control font sizes. Crucially, the requirement specifies targeting "specific sections of a node".6 Therefore, distinct sliders must be instantiated for the global node body, the node title headers, and multiline text areas.  
2. **Color Selections**: Native HTML \<input type="color"\> elements must be implemented to allow users to select hex values for the primary font color, the node canvas background, and the title header background.  
3. **Typographical Selection**: A standard \<select\> element must be instantiated. This dropdown will serve as the selection vector for the custom fonts discovered in the backend directory.  
4. **Outline Styling**: A single \<input type="color"\> control must allow the user to define the node outline hue. A selectable outline-effect mode dropdown is out of scope.

To maintain compatibility with the ComfyUI Nodes 2.0 widgetValueStore and ensure that user configurations survive page reloads, each of these DOM elements must be strictly bound to the node's serialization engine.13 When invoking addDOMWidget, the options object must explicitly define getValue() and setValue(v) callback functions.28

The getValue() function must return the current state of the DOM element (e.g., return colorPicker.value). The setValue(v) function is triggered by ComfyUI when loading a workflow; it receives the saved value and must apply it to the DOM element (e.g., colorPicker.value \= v), followed immediately by dispatching an internal event to trigger the CSS injection engine, ensuring the visual state synchronizes with the restored data.13 Furthermore, whenever a user interacts with a widget, the DOM event listener (e.g., input or change) must manually assign the new value to the widget's internal property and invoke app.graph.setDirtyCanvas(true, false) to force a graph-level re-render and inform the system that unsaved changes exist.

## **Typographical Engine: Asynchronous Font Management**

The requirement to support a dedicated folder for custom fonts presents a unique challenge in a web-based architecture. A browser cannot arbitrarily render a font simply by injecting its URL into a CSS font-family declaration if the font binary has not been formally requested, downloaded, and parsed by the browser's rendering engine.20 This necessitates the implementation of the CSS Font Loading API.

### **Discovery, Hydration, and the FontFace API**

The typography\_manager.js module is responsible for orchestrating the typographical lifecycle. During the extension's global setup() hook (which executes once upon page load, prior to node instantiation) 14, the manager must execute an asynchronous fetch request targeting the /api/theme\_panel/fonts endpoint established in the backend.25

Upon receiving the JSON payload detailing the available fonts, the manager must hydrate the global state. When the dom\_widget\_factory.js subsequently constructs the \<select\> dropdown for font selection, it queries this global state to populate the \<option\> elements, ensuring the interface accurately reflects the contents of the physical host directory.

When a user selects a new font from the dropdown, the standard CSS application is insufficient. The typography\_manager.js must intercept the selection and instantiate a new FontFace object.20 The syntax requires mapping the synthesized font-family name to the static delivery URL: const customFont \= new FontFace(familyName, 'url(' \+ fontUrl \+ ')');.21

Crucially, the manager must then execute customFont.load(), which returns a Promise.20 This forces the browser to initiate the network request to the aiohttp static route, download the .ttf or .woff2 binary, and validate its structural integrity. Only upon successful resolution of this Promise should the script execute document.fonts.add(customFont) to append the asset to the global document registry.20 Finally, once the font is registered, the manager signals the css\_style\_injector.js to update the global stylesheet.

Robust error handling is mandatory at this juncture. If a user places a corrupted or incompatible file into the /fonts/ directory, the customFont.load() Promise will transition to a failed state.20 The coding agent must implement a .catch() block that traps this failure, dispatches a UI notification warning the user of the corrupted asset, and gracefully degrades the CSS application to fall back to standard web-safe fonts (e.g., Arial, sans-serif) to prevent catastrophic layout collapse within the node graph.29

## **Thematic Engine: CSS Injection and Outline Styling**

The core mechanism by which the Control Panel exerts authority over the ComfyUI Nodes 2.0 environment is through dynamic, targeted CSS injection. In legacy iterations, altering node appearance required intercepting canvas rendering algorithms.8 In Nodes 2.0, the Vue components derive their visual properties from cascading stylesheets, explicitly relying on a complex hierarchy of CSS variables (custom properties) and scoped class names.6

### **Dynamic Stylesheet Management**

To avoid the severe performance penalties associated with iteratively applying inline styles to thousands of individual DOM elements during massive workflow execution, the css\_style\_injector.js module must manage a single, centralized \<style\> block. Upon initialization, the module should create a \<style id="comfy-theme-control-panel-overrides"\> element and append it to the document.head.

As the user manipulates the sliders and color pickers in the Control Panel, the state management system aggregates the current values. The thematic engine then mathematically constructs a formatted string of CSS rules and replaces the innerHTML of the \<style\> block. This leverages the browser's native CSS parsing engine to instantly and globally reflow the targeted Vue components.

### **Targeting Specific Node Sections and Overriding PrimeVue**

The prompt explicitly requires the ability to adjust font sizes for "specific sections of a node (e.g., title, text area, etc.)". To execute this, the coding agent must target the exact CSS classes utilized by the Nodes 2.0 frontend, employing the \!important flag liberally to supersede the heavy specificity generated by the PrimeVue component library.6

The CSS compilation logic must generate rules adhering to the following topological mapping:

1. **Global Node Body Font Size**: Target the root node class .comfy-node and its descendants to adjust the baseline typography. .comfy-node,.comfy-node \* { font-size: var(--custom-body-size)\!important; } .6  
2. **Node Title Header Font Size**: Target the specific header class utilized by the Vue wrapper. .comfy-node-title { font-size: var(--custom-title-size)\!important; } .6  
3. **Multiline Text Area Font Size**: Target the text input classes for operational widgets. .comfy-multiline-input { font-size: var(--custom-textarea-size)\!important; } .6  
4. **Font Color**: Apply globally to the node structure. .comfy-node { color: var(--custom-font-color)\!important; } .6  
5. **Node Background Color**: Target the primary node wrapper. .comfy-node { background-color: var(--custom-bg-color)\!important; } .6  
6. **Title Background Color**: Target the header specifically, overriding any default gradients or solid colors applied by the baseline theme. .comfy-node-title { background-color: var(--custom-title-bg-color)\!important; } .6

### **Stable Outline Styling for Node Outlines**

A core requirement of this PRD is deterministic control over node outline styling using a single non-animated mode. Under Nodes 2.0, nodes are fundamentally DOM \<div\> elements, meaning they support CSS3 properties such as box-shadow and border.9

The outline color control passes a hue value to the thematic engine, which compiles one deterministic rule for outline rendering.

* **Stable Outline (Single Mode)**: The baseline and only supported implementation. The engine injects a non-animated outline treatment driven by --custom-outline-color (for example via inset box-shadow or border-equivalent styling on safe outline layers).

By centralizing this transformation within a single dynamic stylesheet rule, rendering remains stable and avoids the extra variability introduced by animated outline modes.

## **Data Persistence, Deserialization, and State Synchronization**

A ubiquitous challenge in developing custom user interfaces within node-based graphs is guaranteeing data persistence. When a user spends considerable time fine-tuning exact hex colors, typographical scales, and outline colors, that exact state must be preserved when the workflow is exported to a JSON file and perfectly recreated when that JSON is subsequently loaded.25

Because the Control Panel lacks standard inputs and outputs, it relies wholly on the serialization of its internal widgets array. As defined in the DOM Widget Factory section, the getValue() hook ensures that during a save operation, ComfyUI iterates over the node, extracts the scalar values from the sliders, color pickers, and dropdowns, and embeds them securely into the workflow's structured JSON format.28

The critical engineering task lies in the deserialization phase. When a workflow is loaded, ComfyUI instantiates the node, recreates the DOM widgets via the nodeCreated hook, and systematically fires the setValue(v) function for each widget, passing in the preserved data.12

If the frontend architecture only updates the CSS stylesheet when a user physically clicks or drags a slider, loading a saved workflow will result in a visual desynchronization: the widgets will display the correct saved values, but the graph will maintain the default aesthetic. To prevent this, the setValue(v) callbacks defined within the addDOMWidget options must be meticulously engineered to not only update the underlying HTML input element (e.g., setting element.value \= v) but to also immediately forward that new value to the css\_style\_injector.js module.

To prevent a cascade of redundant CSS compilations during the loading phase—where dozens of setValue(v) calls might execute within milliseconds—the thematic engine's injection function should be wrapped in a debounce utility or throttled via requestAnimationFrame. This ensures that all saved parameters are collected, and the stylesheet is compiled and injected exactly once after the hydration cycle completes, seamlessly snapping the entire ComfyUI environment into the user's preferred aesthetic without requiring manual intervention.

## **Architectural Constraints, Security, and Edge Case Mitigation**

While the Nodes 2.0 Vue architecture provides a robust foundation for DOM-based manipulation 1, deploying global stylesheet overrides within a deeply complex inference ecosystem introduces several edge cases that the coding agent must anticipate and mitigate to maintain absolute stability.

### **Interoperability with Legacy Canvas Rendering**

Although this PRD is explicitly targeted at the Nodes 2.0 environment, the ComfyUI frontend retains a toggle allowing users to revert to the legacy LiteGraph.js canvas rendering system.1 If a user disables Nodes 2.0, the Vue components (.comfy-node, .comfy-node-title) will cease to exist in the DOM, rendering the dynamic stylesheet injection entirely inert.

A resilient extension must detect the active rendering paradigm. The css\_style\_injector.js module should evaluate the DOM environment upon initialization—for instance, by checking for the existence of the .comfy-vue-rendering class on the document body or utilizing global app state variables. If the legacy canvas system is detected, the extension should gracefully degrade. Because animated outline modes are out of scope, it should retain only the static outline color pathway and redirect color picker outputs to modify the underlying LiteGraph configuration arrays directly where needed (e.g., overriding app.canvas.clear\_background\_color or iterating through the graph to adjust the node.color and node.bgcolor properties).6

### **Performance Overhead and Event Throttling**

Continuous, real-time generation of CSS stylesheets can introduce significant rendering latency, particularly during continuous user interactions such as dragging a font-size range slider. Every time the innerHTML of the global \<style\> tag is replaced, the browser must parse the new rules, recalculate the layout for every affected element, and repaint the screen.

If this occurs dozens of times per second during a slider drag, the ComfyUI interface will stutter severely, violating the performance optimization mandates of the frontend.1 Consequently, all DOM event listeners (input, mousemove) attached to the widgets within the Control Panel must execute through a high-performance throttle. By wrapping the CSS compilation trigger in a requestAnimationFrame loop, the extension guarantees that stylesheet updates perfectly synchronize with the browser's native display refresh rate (typically 60 frames per second), ensuring buttery-smooth visual transitions as the user scales text or shifts hues.

### **Security and Path Traversal Mitigation**

As previously addressed in the backend routing section, any mechanism that exposes local filesystem paths over HTTP introduces critical security vulnerabilities.24 Within the context of an open-source inference engine often deployed on networked or cloud infrastructure, failing to secure the /fonts/ directory route could allow malicious remote users to traverse the host's directory structure (e.g., requesting ../../../../../etc/passwd or equivalent sensitive system files).24

The coding agent must strictly enforce absolute path resolution in the Python backend. The application must calculate the absolute, resolved path of the intended /fonts/ directory upon startup. Whenever a font file is requested or scanned, the application must resolve the requested target path and verify that the os.path.commonpath of both the target and the root font directory perfectly match the root font directory itself. Any request attempting to traverse outside this explicit boundary must be immediately rejected with a 403 Forbidden HTTP status code, ensuring the absolute integrity of the host system while securely fulfilling the typographical requirements of the Control Panel interface.

#### **Referenzen**

1. Nodes 2.0 \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/interface/nodes-2](https://docs.comfy.org/interface/nodes-2)  
2. DOM widget values: architectural mismatch between store ownership and DOM delegation · Issue \#9194 · Comfy-Org/ComfyUI\_frontend \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI\_frontend/issues/9194](https://github.com/Comfy-Org/ComfyUI_frontend/issues/9194)  
3. Comfyui UI 2.0 breaking your custom widgets too? \- Reddit, Zugriff am Mai 17, 2026, [https://www.reddit.com/r/comfyui/comments/1pnnpa7/comfyui\_ui\_20\_breaking\_your\_custom\_widgets\_too/](https://www.reddit.com/r/comfyui/comments/1pnnpa7/comfyui_ui_20_breaking_your_custom_widgets_too/)  
4. Properties \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/custom-nodes/backend/server\_overview](https://docs.comfy.org/custom-nodes/backend/server_overview)  
5. Is there a way to hide inputs and outputs of a grouped node without removing the links to other nodes? : r/comfyui \- Reddit, Zugriff am Mai 17, 2026, [https://www.reddit.com/r/comfyui/comments/1hl3pyv/is\_there\_a\_way\_to\_hide\_inputs\_and\_outputs\_of\_a/](https://www.reddit.com/r/comfyui/comments/1hl3pyv/is_there_a_way_to_hide_inputs_and_outputs_of_a/)  
6. Customizing ComfyUI Appearance, Zugriff am Mai 17, 2026, [https://docs.comfy.org/interface/appearance](https://docs.comfy.org/interface/appearance)  
7. ComfyUI Node: Font \- RunComfy, Zugriff am Mai 17, 2026, [https://www.runcomfy.com/comfyui-nodes/comfyui-mixlab-nodes/Font](https://www.runcomfy.com/comfyui-nodes/comfyui-mixlab-nodes/Font)  
8. Comfy UI nodes that renders/shows texts in HTML element other than textarea \#2988, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI/discussions/2988](https://github.com/Comfy-Org/ComfyUI/discussions/2988)  
9. ComfyUI-Niutonian-Themes \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Niutonian/ComfyUI-Niutonian-Themes](https://github.com/Niutonian/ComfyUI-Niutonian-Themes)  
10. Manager buttons unstyled due to PrimeVue 4 lazy CSS injection · Issue \#2762 \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI-Manager/issues/2762](https://github.com/Comfy-Org/ComfyUI-Manager/issues/2762)  
11. Comfy Objects \- LiteGraph \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/custom-nodes/js/javascript\_objects\_and\_hijacking](https://docs.comfy.org/custom-nodes/js/javascript_objects_and_hijacking)  
12. Gap between DOM and built-in widgets after node resize · Issue \#7942 \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI\_frontend/issues/7942](https://github.com/Comfy-Org/ComfyUI_frontend/issues/7942)  
13. Design clean extension API for custom widget value-store integration with deprecation warning for raw inputEl.value writes · Issue \#11889 · Comfy-Org/ComfyUI\_frontend \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI\_frontend/issues/11889](https://github.com/Comfy-Org/ComfyUI_frontend/issues/11889)  
14. Getting Started \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/custom-nodes/walkthrough](https://docs.comfy.org/custom-nodes/walkthrough)  
15. Javascript Extensions \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/custom-nodes/js/javascript\_overview](https://docs.comfy.org/custom-nodes/js/javascript_overview)  
16. Hidden and Flexible inputs \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/custom-nodes/backend/more\_on\_inputs](https://docs.comfy.org/custom-nodes/backend/more_on_inputs)  
17. Routes \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/development/comfyui-server/comms\_routes](https://docs.comfy.org/development/comfyui-server/comms_routes)  
18. Web Server Advanced — aiohttp 3.8.1 documentation, Zugriff am Mai 17, 2026, [https://docs.aiohttp.org/en/v3.8.1/web\_advanced.html](https://docs.aiohttp.org/en/v3.8.1/web_advanced.html)  
19. web/extensions/logging.js.example · spideyrim/ComfyUI at main \- Hugging Face, Zugriff am Mai 17, 2026, [https://huggingface.co/spideyrim/ComfyUI/blob/main/web/extensions/logging.js.example](https://huggingface.co/spideyrim/ComfyUI/blob/main/web/extensions/logging.js.example)  
20. CSS Font Loading API \- MDN Web Docs, Zugriff am Mai 17, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/CSS\_Font\_Loading\_API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API)  
21. Getting started with CSS Font Loading | by Manuel Matuzovic \- Medium, Zugriff am Mai 17, 2026, [https://medium.com/@matuzo/getting-started-with-css-font-loading-e24e7ffaa791](https://medium.com/@matuzo/getting-started-with-css-font-loading-e24e7ffaa791)  
22. TIL you can do custom css styling in ComfyUI (i just did it to make the 'Run' button bigger), Zugriff am Mai 17, 2026, [https://www.reddit.com/r/comfyui/comments/1ojmnp7/til\_you\_can\_do\_custom\_css\_styling\_in\_comfyui\_i/](https://www.reddit.com/r/comfyui/comments/1ojmnp7/til_you_can_do_custom_css_styling_in_comfyui_i/)  
23. ComfyUI-HY-Motion1/\_\_init\_\_.py at master \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/jtydhr88/ComfyUI-HY-Motion1/blob/master/\_\_init\_\_.py](https://github.com/jtydhr88/ComfyUI-HY-Motion1/blob/master/__init__.py)  
24. Don't Get Too Comfortable: Hacking ComfyUI Through Custom Nodes | Snyk Labs, Zugriff am Mai 17, 2026, [https://labs.snyk.io/resources/hacking-comfyui-through-custom-nodes/](https://labs.snyk.io/resources/hacking-comfyui-through-custom-nodes/)  
25. Server Overview \- ComfyUI Official Documentation, Zugriff am Mai 17, 2026, [https://docs.comfy.org/development/comfyui-server/comms\_overview](https://docs.comfy.org/development/comfyui-server/comms_overview)  
26. ComfyUI-React-Extension-Template/\_\_init\_\_.py at main \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI-React-Extension-Template/blob/main/\_\_init\_\_.py](https://github.com/Comfy-Org/ComfyUI-React-Extension-Template/blob/main/__init__.py)  
27. comfyui-deploy/custom\_routes.py at main \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/BennyKok/comfyui-deploy/blob/main/custom\_routes.py](https://github.com/BennyKok/comfyui-deploy/blob/main/custom_routes.py)  
28. Loading Workflow Data, forceInput and Multiline Text · Issue \#9017 · Comfy-Org/ComfyUI, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI/issues/9017](https://github.com/Comfy-Org/ComfyUI/issues/9017)  
29. Changable Fonts · Issue \#3085 · Comfy-Org/ComfyUI \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI/issues/3085](https://github.com/Comfy-Org/ComfyUI/issues/3085)  
30. \[Potential Bug\] Node Color Handling · Issue \#6806 · Comfy-Org/ComfyUI\_frontend \- GitHub, Zugriff am Mai 17, 2026, [https://github.com/Comfy-Org/ComfyUI\_frontend/issues/6806](https://github.com/Comfy-Org/ComfyUI_frontend/issues/6806)
