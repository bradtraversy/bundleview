import { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import BundleAnalysis from './components/BundleAnalysis';
import { BundleData } from './types';
import { bundleAnalyzer } from './utils/bundleAnalyzer';

const App = () => {
  const [bundleData, setBundleData] = useState<BundleData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    setIsAnalyzing(true);
    try {
      // Process files using the real bundle analyzer
      const data = await bundleAnalyzer.analyzeFiles(files);
      setBundleData(data);
    } catch (error) {
      console.error('Error processing bundle files:', error);
      // Handle error state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setBundleData(null);
  };

  return (
    <div className='min-h-screen bg-dark-bg'>
      <Header />

      <main className='container mx-auto px-4 py-8'>
        {!bundleData ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <BundleAnalysis bundleData={bundleData} onReset={resetAnalysis} />
        )}
      </main>
    </div>
  );
};

export default App;
