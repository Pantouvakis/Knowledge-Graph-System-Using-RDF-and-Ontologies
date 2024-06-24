import React from 'react';

const DownloadRDF = ({ generateRDFContent }) => {
  const downloadRDF = () => {
    const rdfContent = generateRDFContent();
    const blob = new Blob([rdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'knowledge_graph.rdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button onClick={downloadRDF}>Download RDF</button>
  );
};

export default DownloadRDF;
