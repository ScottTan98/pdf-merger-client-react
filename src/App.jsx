import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ReactSortable } from "react-sortablejs";

function App() {
    const [files, setFiles] = useState([]);
    const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
    const [pdfName, setPdfName] = useState("merged");

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).map((file, index) => ({
            id: index,
            file,
            name: file.name,
        }));
        setFiles(selectedFiles);
    };

    const handleNameChange = (e) => {
        setPdfName(e.target.value);
    };

    const mergePDFs = async () => {
        if (files.length < 2) {
            alert("Please select at least two PDF files.");
            return;
        }

        const mergedPdf = await PDFDocument.create();

        for (let { file } of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        setMergedPdfUrl(URL.createObjectURL(blob));
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Merge PDF Files</h2>
            <input type="file" multiple accept="application/pdf" onChange={handleFileChange} />
            <br /><br />

            {files.length > 0 && (
                <div>
                    <h3>Reorder PDFs:</h3>
                    <ReactSortable list={files} setList={setFiles} animation={150}>
                        {files.map(({ id, name }) => (
                            <div key={id} style={fileItemStyle}>
                                {name}
                            </div>
                        ))}
                    </ReactSortable>
                </div>
            )}

            <br />
            <input
                type="text"
                placeholder="Enter file name..."
                value={pdfName}
                onChange={handleNameChange}
                style={{ padding: "5px", marginBottom: "10px" }}
            />
            <br />
            <button onClick={mergePDFs} style={{ marginTop: "10px" }}>Merge PDFs</button>

            {mergedPdfUrl && (
                <div>
                    <h3>Merged PDF:</h3>
                    <a href={mergedPdfUrl} download={`${pdfName || "merged"}.pdf`}>
                        Download {pdfName || "merged"}.pdf
                    </a>
                </div>
            )}
        </div>
    );
}

const fileItemStyle = {
    padding: "10px",
    margin: "5px",
    border: "1px solid black",
    cursor: "grab",
    backgroundColor: "#f9f9f9",
};

export default App;
