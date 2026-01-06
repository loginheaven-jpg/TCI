import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { parseCSV, validateTCIData, CSV_COLUMNS } from '../../utils/csvParser';

export default function CSVUploader({ isOpen, onClose, onUpload, groupId }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // upload, preview, complete
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['CSV 파일만 업로드할 수 있습니다.']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setLoading(true);

    try {
      const text = await selectedFile.text();
      const { data, errors: parseErrors } = parseCSV(text);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setParsedData(null);
      } else {
        const { validData, errors: validationErrors } = validateTCIData(data);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        }
        if (validData.length > 0) {
          setParsedData(validData);
          setStep('preview');
        }
      }
    } catch (err) {
      setErrors(['파일을 읽는 중 오류가 발생했습니다.']);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setLoading(true);
    try {
      await onUpload(parsedData, groupId);
      setStep('complete');
    } catch (err) {
      setErrors([err.message || '업로드에 실패했습니다.']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setErrors([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* 드래그앤드롭 영역 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center
                  hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl
                      flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-3xl text-white">📄</span>
        </div>
        <p className="text-gray-700 font-medium mb-2">
          CSV 파일을 선택하거나 드래그하세요
        </p>
        <p className="text-sm text-gray-500">
          TCI 검사 결과 데이터 파일
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* CSV 형식 안내 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-700 mb-2">CSV 필수 컬럼</h4>
        <p className="text-xs text-gray-500 mb-2">TCI 검사 결과 파일 또는 아래 형식 지원</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• 이름 (또는 name)</div>
          <div>• NST, NSP (자극추구)</div>
          <div>• HAT, HAP (위험회피)</div>
          <div>• RDT, RDP (사회적민감성)</div>
          <div>• PST, PSP (인내력)</div>
          <div>• SDT, SDP (자율성)</div>
          <div>• COT, COP (연대감)</div>
          <div>• STT, STP (자기초월)</div>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="error" onClose={() => setErrors([])}>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <Alert variant="info">
        {parsedData?.length}명의 데이터를 업로드합니다.
      </Alert>

      {/* 데이터 미리보기 테이블 */}
      <div className="max-h-64 overflow-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">이름</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">NS</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">HA</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">RD</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">PS</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">SD</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">CO</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">ST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parsedData?.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-800">{row.name}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.ns_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.ha_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.rd_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.ps_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.sd_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.co_t}</td>
                <td className="px-4 py-2 text-center text-gray-600">{row.st_t}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {parsedData?.length > 10 && (
          <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
            외 {parsedData.length - 10}명...
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <Alert variant="warning">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setStep('upload');
            setParsedData(null);
            setFile(null);
          }}
        >
          다시 선택
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleUpload}
          loading={loading}
        >
          업로드
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl
                    flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
        <span className="text-3xl text-white">✓</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">업로드 완료!</h3>
      <p className="text-gray-500 mb-6">
        {parsedData?.length}명의 데이터가 성공적으로 업로드되었습니다.
      </p>
      <Button variant="primary" onClick={handleClose}>
        확인
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'complete' ? '' : 'CSV 파일 업로드'}
      size="lg"
      closeOnBackdropClick={false}
    >
      {step === 'upload' && renderUploadStep()}
      {step === 'preview' && renderPreviewStep()}
      {step === 'complete' && renderCompleteStep()}
    </Modal>
  );
}
