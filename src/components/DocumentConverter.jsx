import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentConversion } from '../hooks/useDocumentConversion';
import { toolByPath, uploaderCopy } from '../data/toolCatalogue';
import { FileUploader } from './FileUploader';
import { FilePreview } from './FilePreview';
import { ConversionProgress } from './ConversionProgress';
import { ConversionResult } from './ConversionResult';
import { Notification } from './Notification';

const headingFromPath = (pathname) => {
  const leaf = pathname.split('/').filter(Boolean).pop() ?? '';
  return leaf.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

export const DocumentConverter = ({
  outputType,
  accept,
  multiple = false,
  maxFiles = 0,
  apiFn,
  validateFn,
  convertButtonText,
  renderExtraControls,
  extraArg,
  extraArgRequired
}) => {
  // The tool's own name and one-line description come from the shared catalogue, so the
  // nav label, the page heading and the document title can never disagree again.
  const { pathname } = useLocation();
  const tool = toolByPath(pathname);
  const title = tool?.name ?? headingFromPath(pathname);
  const description = tool?.desc ?? '';
  const { titleText, buttonText } = uploaderCopy(accept, multiple);
  // A tool's convert button defaults to its own catalogue name, so the nav label, the
  // heading and the button can never spell the tool three ways. Pages override it only to
  // name the output format ("Convert to Word").
  const convertLabel = convertButtonText ?? title;
  const [optionError, setOptionError] = useState(null);

  const {
    file,
    files,
    error,
    downloadFileName,
    resultBlob,
    selectFile,
    selectFiles,
    removeFile,
    startConversion,
    handleDownload,
    dismissError,
    hasSelection,
    reset,
    isIdle,
    isFileSelected,
    isConverting,
    isSuccess,
    isError
  } = useDocumentConversion();

  const handleFileSelect = (selected) => {
    const accepted = multiple && Array.isArray(selected)
      ? selectFiles(selected, validateFn)
      : selectFile(selected, validateFn);
    if (accepted) setOptionError(null);
  };

  const handleConvert = () => {
    if (extraArgRequired && String(extraArg ?? '').trim() === '') {
      setOptionError(extraArgRequired);
      return;
    }
    setOptionError(null);
    startConversion(apiFn, outputType, extraArg, multiple);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#0bff03] tracking-tight">{title}</h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="w-full">
        {optionError && (
          <Notification severity="error" message={optionError} onDismiss={() => setOptionError(null)} />
        )}
        {error && <Notification severity="error" message={error} onDismiss={dismissError} />}

        {(isIdle || (isError && !hasSelection)) && (
          <FileUploader
            accept={accept}
            multiple={multiple}
            maxFiles={maxFiles}
            onFileSelected={handleFileSelect}
            onFilesRejected={(message) => setOptionError(message)}
            titleText={titleText}
            buttonText={buttonText}
          />
        )}

        {(isFileSelected || (isError && hasSelection)) && (
          <FilePreview
            file={file}
            files={files}
            onRemove={removeFile}
            onConvert={handleConvert}
            convertButtonText={convertLabel}
            isConverting={isConverting}
            extraControls={renderExtraControls ? renderExtraControls() : null}
          />
        )}

        {isConverting && <ConversionProgress />}

        {isSuccess && (
          <div role="status" aria-live="polite">
            <ConversionResult
              originalFile={file || files[0]}
              downloadFileName={downloadFileName}
              onDownload={handleDownload}
              onReset={reset}
              outputType={outputType}
              outputSize={resultBlob?.size}
            />
          </div>
        )}
      </div>
    </div>
  );
};
