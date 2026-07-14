
---

## 1. Các chức năng HIỆN CÓ trong Project này

Hệ thống hiện tại đã hoàn thiện hầu hết các luồng nghiệp vụ cốt lõi, bao gồm:

### 👤 Khách vãng lai (Guest) / Người dùng chung
Đăng ký tài khoản: Dành cho Học viên mới.
Đăng nhập: Hỗ trợ phân quyền (Admin, Teacher, Student) dựa trên JWT.
Xem Danh sách khóa học : Hiển thị danh sách các khóa học đang mở.
Chi tiết khóa học: Xem thông tin mô tả, giá tiền, lộ trình học trước khi quyết định mua.

### 👨‍🎓 Học viên (Student)
Thống kê: Thống kê tổng quan số khóa học đang học, số khóa học đã hoàn thành.
Giỏ hàng: khi bấm đăng ký sẽ tự động chuyển sang giỏ hàng
Đăng ký môn học: Thêm khóa học vào giỏ và tiến hành thanh toán (Checkout).
Lịch học (My Schedule): Xem thời khóa biểu các môn đã đăng ký thành công.
Khóa học của tôi: Truy cập vào các khóa học đã được duyệt.
Tài liệu học tập: Tải xuống bài giảng (PDF, Word, Ảnh...) do giáo viên upload cho lớp đó.
Kết quả học tập: Xem chi tiết bảng điểm (Chuyên cần, Giữa kỳ, Cuối kỳ) và điểm tổng kết.
Đánh giá (Rating): Đánh giá sao (1-5) và để lại nhận xét cho khóa học sau khi học xong.

### 👨‍🏫 Giảng viên (Teacher)
-Thống kê: Thống kê số lớp đang dạy, tổng số sinh viên.
-Xem Khóa học phụ trách: Xem danh sách các môn/lớp mình được Admin phân công dạy.
-Xem Danh sách học viên: Xem danh sách các sinh viên trong lớp học của mình.
-Quản lý tài liệu: Tải lên và xóa bài giảng, tài liệu tham khảo cho từng môn học .
-Quản lý điểm số: Nhập điểm và cập nhật điểm (Chuyên cần, Giữa kỳ, Cuối kỳ) cho học viên trong lớp.
-Lịch giảng dạy: Xem lịch dạy của mình.

### 👨‍💻 Quản trị viên (Admin)
-Thống kê (Dashboard): Xem tổng quan về Doanh thu, số lượng người dùng, số khóa học, số lớp học.
-Quản lý Giảng viên: Thêm mới (cấp tài khoản), sửa, xóa, khóa/mở khóa tài khoản người dùng
-Học viên: xóa tk sinh viên (nếu sinh viên không đi học)
-Quản lý Khóa học: Tạo mới khóa học, định giá, up ảnh bìa, chỉnh sửa mô tả.
-Quản lý Phòng học: Khởi tạo các phòng học (Classroom).
-Quản lý Lịch học (Schedules): Xếp lịch cho khóa học, gắn phòng học, phân công Giảng viên.
-Quản lý Thanh Toán: Xem danh sách các giao dịch thanh toán từ học viên, Duyệt hoặc Từ chối hóa đơn

---

