import initWasmModule from './gxtool.js';

// ----------multiplefile-upload---------
$("#fileupload").fileinput({
    theme: "explorer-fas",
    uploadUrl: "#",
    deleteUrl: "#",
    initialPreviewAsData: true,
    // hiddenThumbnailContent: true,
    overwriteInitial: false,
    dropZoneTitle: '<div class="upload-area"><i class="far fa-file-image"></i><p>Browse or Drag and Drop a PNG file</p> <div> <button type="button">Browse File</button> </div></div>',
    dropZoneClickTitle: "",
    browseOnZoneClick: true,
    showRemove: false,
    showUpload: true,
    showZoom: false,
    showCaption: false,
    showBrowse: false,
    uploadClass: "btn btn-dark",
    uploadLabel: "Convert",
    browseClass: "btn btn-danger",
    browseLabel: "",
    browseIcon: "<i class='fa fa-plus'></i>",
    fileActionSettings: {
        showRemove: true,
        showUpload: false,
        showDownload: false,
        showZoom: false,
        showDrag: false,
        removeIcon: "<i class='fa fa-times'></i>",
        uploadIcon: "<i class='fa fa-upload'></i>",
        dragIcon: "<i class='fa fa-arrows-alt'></i>",
        uploadRetryIcon: "<i class='fa fa-undo-alt'></i>",
        dragClass: "file-drag",
        removeClass: "file-remove",
        removeErrorClass: 'file-remove',
        uploadClass: "file-upload",
    },
    fileTypeSettings: {
        object: function (vType, vName) {
            return false;
        },
        other: function (vType, vName) {
            return true;
        },
    },
    previewFileIcon: '<i class="fas fa-clone"></i>',
    frameClass: "file-sortable",
    layoutTemplates: {
        preview:
            '<div class="file-preview {class}">\n' +
            '    <div class="{dropClass}">\n' +
            '    <div class="clearfix"></div>' +
            '    <div class="file-preview-status text-center text-success"></div>\n' +
            '    <div class="kv-fileinput-error"></div>\n' +
            '    </div>\n' +
            '</div>' +
            ' <div class="file-preview-thumbnails">\n' +
            ' </div>\n',
        actionDrag: '<button class="file-drag-handle {dragClass}" title="{dragTitle}">{dragIcon}</button>',
        footer: '<div class="file-thumbnail-footer">\n' + '<div class="file-detail">' + '<div class="file-caption-name">{caption}</div>\n' + '    <div class="file-size">{size}</div>\n' + '</div>' + "   {actions}\n" + '</div>',
    },
    uploadAsync: false,
    uploadUrl: null,
}).show();

$('#formupload').submit(function(e){
    e.preventDefault();
    handleFileUpload();
});

function handleFileUpload() {
    const uploadProgress = $('kv-upload-progress');

    const fileInput = document.getElementById('fileupload');
    const file = fileInput.files[0]; // Get the first file
    console.log("File:", file);
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result; // The ArrayBuffer
            const length = arrayBuffer.byteLength; // The length of the buffer

            console.log("ArrayBuffer:", arrayBuffer);
            console.log("Length:", length);

            const fileBuffer = new Uint8Array(arrayBuffer); // Convert the buffer to a typed array
            handleFileConvert(fileBuffer);
        };

        reader.onerror = function(e) {
            console.error("Error reading file:", e);
        };

        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }
}

async function handleFileConvert(fileBuffer) {
    // Initialize the WASM module
    const wasmModule = await initWasmModule();
    console.log(wasmModule.FS.readdir('/'))

    // Create a file in the WASM virtual filesystem (FS)
    wasmModule.FS.createDataFile("/", "backdrop.png", fileBuffer, true, true);

    // Use cwrap to wrap the exported C function
    const mainFunction = wasmModule.cwrap('call_main', 'number', []);

    // // Call the function and display the result
    const result = mainFunction();
    console.log('Result of main:', result);

    if (result == 0) {
        const contents = wasmModule.FS.readFile('backdrop.tpl');
        downloadData(contents, 'backdrop.tpl');
    }
}

function downloadData(data, filename) {
    const blob = new Blob([data], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
