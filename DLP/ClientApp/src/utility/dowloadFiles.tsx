
const downloadFilesFromBase64 = (files: any[]) => {
    files.forEach(({ fileContents, contentType, fileName }) => {
        const bytes = Uint8Array.from(atob(fileContents), c => c.charCodeAt(0));
        const url = window.URL.createObjectURL(new Blob([bytes], { type: contentType }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    });
}

function base64ToFile(file : any) {

    const { fileContents, contentType, fileName } = file;
    // Convert base64 to Uint8Array
    const byteCharacters = atob(fileContents);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return new File([blob], fileName, { type: contentType });
}




export { downloadFilesFromBase64, base64ToFile }