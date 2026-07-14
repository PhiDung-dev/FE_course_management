import { useState } from 'react';
import { BookOpen, FileText, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function StudentDocuments() {
  const { currentUser } = useAuth();
  const { courses, enrollments } = useData();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Get courses the student is enrolled in
  const myEnrollments = enrollments.filter(e => e.studentId === currentUser?.id && e.status === 'active');
  const myCourses = courses.filter(c => myEnrollments.some(e => e.courseId === c.id));
  const selectedCourse = myCourses.find(c => c.id === selectedCourseId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tài liệu học tập</h1>
        <p className="text-gray-500 text-sm mt-1">Xem và tải xuống tài liệu từ các môn học bạn đã đăng ký</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn môn học</label>
        <select 
          value={selectedCourseId} 
          onChange={e => setSelectedCourseId(e.target.value)}
          className="w-full max-w-md py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">-- Chọn môn học --</option>
          {myCourses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
                    <a 
                      href={doc.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                    >
                      <Download size={16} />
                      Tải xuống
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                <p>Môn học này chưa có tài liệu nào.</p>
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
