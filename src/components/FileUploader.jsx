import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileUp } from 'lucide-react';

/** Names the rejected files per reason so a batch doesn't have to be bisected. */
const rejectedGroup = (rejected, code) => {
  const list = [
    ...new Set(
      rejected
        .filter((r) => (r.errors || []).some((e) => e.code === code))
        .map((r) => r.file?.name)
        .filter(Boolean)
    )
  ];
  if (list.length === 0) return null;
  return {
    subject: list.length > 3 ? `${list.slice(0, 3).join(', ')}, +${list.length - 3} more` : list.join(', '),
    plural: list.length > 1
  };
};

const describeRejection = (rejected, maxFiles, maxSizeMb) => {
  const messages = [];

  const tooLarge = rejectedGroup(rejected, 'file-too-large');
  if (tooLarge) messages.push(`${tooLarge.subject} ${tooLarge.plural ? 'are' : 'is'} larger than the ${maxSizeMb} MB limit`);

  const wrongType = rejectedGroup(rejected, 'file-invalid-type');
  if (wrongType) messages.push(`${wrongType.subject} ${wrongType.plural ? 'are' : 'is'} not a format this tool accepts`);

  if (rejectedGroup(rejected, 'too-many-files')) {
    // Measured: react-dropzone rejects *every* picked file once the cap is exceeded,
    // so this never means "just the extras went missing".
    // Single-file pages never pass maxFiles, so the 0 sentinel is what used to be
    // printed ("at most 0 files"); the cap dropzone actually applied is 1.
    const cap = maxFiles > 0 ? maxFiles : 1;
    messages.push(cap === 1
      ? 'this tool works on one file at a time, so nothing was loaded'
      : `this tool works on at most ${cap} files at a time, so nothing was loaded`);
  }

  if (messages.length === 0) return 'One or more files could not be accepted. Please check them and try again.';
  return `${messages.join('; ')}.`;
};

export const FileUploader = ({
  accept,
  maxSize = 25 * 1024 * 1024,
  onFileSelected,
  onFilesRejected,
  multiple = false,
  maxFiles = 0,
  titleText = 'Drag & drop your files here',
  buttonText = 'Choose File'
}) => {
  const maxSizeMb = Math.round(maxSize / 1048576);

  // react-dropzone sorts every picked file into accepted/rejected before we see
  // it. Rejected ones used to be handed to onFileSelected as if they had passed,
  // so an oversized or wrong-type file was still sent to the API.
  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Selection first, rejection notice second: the page clears the message whenever
    // a selection lands, so reporting rejects before it would erase the reason.
    if (acceptedFiles.length > 0) {
      onFileSelected(multiple ? acceptedFiles : acceptedFiles[0]);
    }
    if (rejectedFiles.length > 0) {
      onFilesRejected(describeRejection(rejectedFiles, maxFiles, maxSizeMb));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    maxFiles
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-[#0bff03] bg-[#0bff03]/10 scale-[1.01]'
          : 'border-slate-300 hover:border-[#0bff03] bg-white hover:bg-slate-50/80 shadow-xs'
      }`}
    >
      {/* react-dropzone's input stays in the a11y tree (1px clip, tabindex=-1, not
          aria-hidden), so it needs a name; titleText is already the label users see. */}
      <input {...getInputProps({ 'aria-label': titleText })} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-transform duration-200 ${isDragActive ? 'bg-[#0bff03]/20 text-slate-950 scale-110' : 'bg-slate-100 text-slate-700'}`}>
          {isDragActive ? <FileUp className="w-10 h-10 animate-bounce text-slate-950" /> : <UploadCloud className="w-10 h-10" />}
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">{titleText}</p>
          <p className="text-sm text-slate-500">
            or click to browse from your device
            {multiple ? ' (multiple files allowed)' : null}
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center px-6 py-3 rounded-xl shadow-md text-sm font-bold text-slate-950 bg-[#0bff03] hover:bg-[#09e602] transition-colors">
            {buttonText}
          </span>
        </div>
        <p className="text-xs text-slate-600">Maximum file size: {maxSizeMb} MB</p>
      </div>
    </div>
  );
};
