import { useEffect, useState } from "react";

import * as pdfjs from "pdfjs-dist";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

const { getDocument } = pdfjs;

async function renderPage(pdfDocument: pdfjs.PDFDocumentProxy, page: number) {
  const pageProxy = await pdfDocument.getPage(page);

  const vpt = pageProxy.getViewport({
    scale: 1,
  });

  const canvas = document.createElement("canvas");
  canvas.width = vpt.width;
  canvas.height = vpt.height;
  const ctx = canvas.getContext("2d");

  await pageProxy.render({
    viewport: vpt,
    canvasContext: ctx!,
  }).promise;

  return canvas.toDataURL();
}

function App() {
  const [document, setDocument] = useState<pdfjs.PDFDocumentProxy>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function onFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setDocument(undefined);
    setImages([]);
    setLoading(true)
    const { files } = e.target;
    if (!files) return;


    const reader = new FileReader();
    reader.onload = async function () {
      if (this.result) {
        setDocument(await getDocument(this.result).promise);
      }
    };

    reader.readAsArrayBuffer(files[0]);
  }

  useEffect(() => {
    async function getImages() {
      if (document) {
        const pageCount = document?.numPages;

        const imgs = [];
        for (let i = 1; i <= pageCount; i++) {
          const dataURL = await renderPage(document, i);

          imgs.push(dataURL);

          setImages([...imgs]);
        }
      }
    }

    getImages();
  }, [document]);

  return (
    <>
      <input type="file" accept="pdf" onChange={onFileUpload} />
      {/* {document && document.numPages > images.length && <img src="https://media.tenor.com/jfmI0j5FcpAAAAAM/loading-wtf.gif" />} */}
      <div className="flex-images">
        {images.map((dataUrl, i) => (
          <img key={i} src={dataUrl} />
        ))}
      </div>
    </>
  );
}

export default App;
