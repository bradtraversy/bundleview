import { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import BundleAnalysis from './components/BundleAnalysis';
import { BundleData } from './types';

const App = () => {
  const [bundleData, setBundleData] = useState<BundleData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    setIsAnalyzing(true);
    try {
      // Process files and generate bundle data
      const data = await processBundleFiles(files);
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

// Placeholder function - will be implemented in the analysis engine
const processBundleFiles = async (files: File[]): Promise<BundleData> => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return mock data for now
  return {
    totalSize: 1024 * 1024 * 2.5, // 2.5MB
    totalGzipSize: 1024 * 1024 * 0.8, // 800KB
    modules: [],
    chunks: [],
    insights: [],
    metadata: {
      analyzedAt: new Date().toISOString(),
      fileCount: files.length,
      fileTypes: files.map((f) => f.name.split('.').pop() || 'unknown'),
    },
  };
};

export default App;
