import { useState, useRef } from 'react';
import { Search, FileText, Upload, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotify } from '../../contexts/NotificationContext';
import { uploadFile } from '../../services/api';
import Badge from '../../components/Badge';

export default function TeacherDocuments() {
  const { currentUser } = useAuth();
  const { courses, dispatch } = useData();
  const { addToast } = useToast();
  const { addNotification } = useNotify();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docTitle, setDocTitle] = useState('');

  const myCourses = courses.filter(c => c.teacherId === currentUser?.id);
  const selectedCourse = myCourses.find(c => c.id === selectedCourseId);

  const handleUploadClick = () => {
    if (!selectedCourseId) {
      addToast('error', 'Vui lòng chọn môn học trước khi tải file lên.');
      return;
    }
    if (!docTitle.trim()) {
      addToast('error', 'Vui lòng nhập tên tài liệu trước khi tải file.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;

    try {
      setIsUploading(true);
      const url = await uploadFile(file);
      
      const newDoc = { title: docTitle.trim(), url };
      const newDocs = [...(selectedCourse.documents || []), newDoc];
      const updatedCourse = { ...selectedCourse, documents: newDocs };
      
      await dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      
      addToast('success', 'Đã tải tài liệu lên thành công!');
      addNotification('Tài liệu mới', `Đã thêm tài liệu ${newDoc.title} vào môn ${selectedCourse.name}`, 'system', ['teacher', 'student'], currentUser?.id);
      
      setDocTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      addToast('error', err.message || 'Lỗi khi tải file lên.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (idx: number) => {
    if (!selectedCourse) return;
    const newDocs = (selectedCourse.documents || []).filter((_, i) => i !== idx);
    const updated = { ...selectedCourse, documents: newDocs };
    await dispatch({ type: 'UPDATE_COURSE', payload: updated });
    addToast('success', 'Đã xóa tài liệu.');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Tài liệu</h1>
        <p className="text-gray-500 text-sm mt-1">Đăng tải và quản lý tài liệu học tập (Word, PDF) cho các môn học</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn môn học</label>
          <select 
            value={selectedCourseId} 
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">-- Chọn môn học --</option>
            {myCourses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        {selectedCourseId && (
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên tài liệu mới</label>
            <input 
              type="text" 
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="VD: Slide bài 1..." 
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
            />
          </div>
        )}

        {selectedCourseId && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx" 
              className="hidden" 
            />
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              {isUploading ? 'Đang tải...' : 'Tải file lên'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {selectedCourse ? (
          <div>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-medium text-gray-800">
                Tài liệu của môn: <span className="text-blue-600">{selectedCourse.name}</span>
              </h2>
            </div>
            
            {(selectedCourse.documents || []).length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(selectedCourse.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-800 hover:text-blue-600 hover:underline">
                          {doc.title}
                        </a>
                        <p className="text-xs text-gray-400 mt-0.5 break-all line-clamp-1">{doc.url}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Xóa tài liệu"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                <p>Chưa có tài liệu nào cho môn học này.</p>
                <p className="text-sm mt-1">Sử dụng nút tải file lên ở trên để thêm tài liệu.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
            <p>Vui lòng chọn môn học để xem tài liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}
