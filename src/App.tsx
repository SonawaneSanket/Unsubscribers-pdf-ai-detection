import { Route, Routes } from "react-router-dom";
import UnsubscriberTable from "./components/UnsubscriberTable";
import PdfSummarizer from "./components/PdfSummarizer";


function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Routes>
        <Route path="/" element={<UnsubscriberTable />} />
        <Route path="/pdf" element={<PdfSummarizer />} />
      </Routes>
    </div>
  );
}

export default App;
