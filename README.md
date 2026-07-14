# 🎓 Hệ thống Quản lý Khóa học & Lớp học (Course & Classroom Management System)

Dự án này là một ứng dụng Fullstack hoàn chỉnh, bao gồm hai phần:
- **Frontend**: Single Page Application (SPA) xây dựng bằng **React**, **TypeScript**, **Vite** và **Tailwind CSS**.
- **Backend**: RESTful API Server xây dựng bằng **Java Spring Boot**, **Hibernate (JPA)**, và sử dụng cơ sở dữ liệu **MySQL**.

Hệ thống được thiết kế để quản lý khóa học, lớp học, lịch giảng dạy, tài liệu học tập, đăng ký môn học và thanh toán học phí với 3 vai trò chính:
- **Quản trị viên (Admin)**: Quản lý toàn bộ hệ thống (người dùng, khóa học, lớp học, lịch, doanh thu).
- **Giảng viên (Teacher)**: Quản lý học sinh, môn học được phân công, lịch dạy, tài liệu và nhập điểm.
- **Học viên (Student)**: Xem lịch cá nhân, đăng ký môn học (giỏ hàng/thanh toán), tải tài liệu, xem kết quả và đánh giá khóa học.

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (How to Run)

### 📋 Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- **Node.js** (Khuyến nghị v18 trở lên) & **NPM/Yarn**
- **Java Development Kit (JDK 17+)**
- **MySQL Server** (Đang chạy ở cổng 3306)

---

### 1️⃣ Cấu hình & Chạy Backend (Spring Boot)

1. Mở MySQL và tạo một cơ sở dữ liệu mới mang tên `course_management`:
   ```sql
   CREATE DATABASE course_management;
   ```
2. Mở thư mục `BE_course_management` bằng IDE (IntelliJ IDEA, Eclipse, hoặc VS Code).
3. (Tùy chọn) Kiểm tra cấu hình kết nối Database trong tệp `BE_course_management/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/course_management
   spring.datasource.username=root
   spring.datasource.password=1234 # Đổi mật khẩu này theo máy của bạn
   ```
4. Khởi động Backend bằng Maven:
   - Trên Terminal: 
     ```bash
     cd BE_course_management
     .\mvnw spring-boot:run
     ```
   *(Backend sẽ khởi động ở cổng **8080** và tự động tạo các bảng trong CSDL)*

> **Lưu ý quan trọng**: Lần đầu chạy, hệ thống sẽ tự động tạo một tài khoản Admin mặc định có tên đăng nhập là `admin@gmail.com` và mật khẩu là `admin123`.



---

### 2️⃣ Cấu hình & Chạy Frontend (React/Vite)

1. Mở một Terminal mới (khác với terminal đang chạy Backend) ở thư mục gốc của dự án `web-CNPM-main`.
2. Cài đặt các thư viện Node.js:
   ```bash
   npm install
   ```
3. Chạy Server Frontend:
   ```bash
   npm run dev
   ```
4. Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập bằng đường link: `http://localhost:5173`.
   *(Frontend đã được cấu hình để gọi API tới `http://localhost:8080` tự động thông qua tệp `.env` hoặc mặc định trong `src/services/api.ts`)*

---

## 🔑 Hướng dẫn Test Dự án (Demo Flow)

Để kiểm tra toàn bộ luồng nghiệp vụ của ứng dụng, hãy làm theo các bước sau:

### 1. Phân quyền Admin (Quản trị viên)
- **Tài khoản mặc định**: 
   username: admin@gmail.com
   password: [admin123]
   username: student1@gmail.com
   password: [123456]
   username: teacher@gmail.com
   password: [123456]
- **Các việc cần Test**:
  - Đăng nhập vào hệ thống.
  - Chuyển sang mục **Giáo viên**, tiến hành tạo 1-2 tài khoản Giáo viên mới.
  - Chuyển sang mục **Môn học**, tạo các khóa học cơ bản.
  - Chuyển sang mục **Lớp học** và **Lịch học** để tạo phòng và sắp xếp lịch cho khóa học vừa tạo (phân công cho Giáo viên).

### 2. Phân quyền Student (Học viên)
- **Tài khoản**: Tại trang Login, bấm **"Đăng ký ngay"** để tạo một tài khoản Học viên mới.
- **Các việc cần Test**:
  - Đăng nhập bằng tài khoản vừa tạo.
  - Vào **Mua môn học**, xem danh sách và nhấn thêm khóa học vào **Giỏ hàng**.
  - Vào **Giỏ hàng**, tiến hành "Thanh toán".
  - (Hệ thống sẽ chuyển hóa đơn sang trạng thái Chờ xử lý).

### 3. Phân quyền Admin (Duyệt thanh toán)
- Quay lại tài khoản **Admin**, vào mục **Thanh toán**.
- Duyệt (Đổi trạng thái thành *Đã thanh toán*) cho hóa đơn của Học sinh. Học sinh lúc này chính thức được vào lớp.

### 4. Phân quyền Teacher (Giáo viên)
- Đăng nhập bằng tài khoản Giáo viên đã được phân công lịch học.
- **Các việc cần Test**:
  - Xem mục **Học sinh trong lớp** để xác nhận học viên đã hiện lên.
  - Vào mục **Quản lý Tài liệu**, chọn môn học và tải lên các tệp PDF/Word.
  - Vào mục **Nhập điểm**, chấm điểm Chuyên cần, Giữa kỳ, Cuối kỳ cho học sinh.

### 5. Học viên (Kiểm tra kết quả)
- Đăng nhập lại bằng tài khoản Học viên.
- Nhấp vào **Môn học của tôi** trên Dashboard để xem nội dung, kéo xuống dưới sẽ thấy phần **Tài liệu học tập** mà Giáo viên vừa tải lên (có nút Tải xuống).
- Kiểm tra mục **Kết quả học tập** để xem điểm số đã được chấm.
- Kiểm tra mục **Đánh giá môn học** để để lại Review/Rating cho môn học.

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### 💻 Frontend
- **React.js** + **TypeScript**: Xây dựng UI linh hoạt, an toàn kiểu dữ liệu.
- **Vite**: Bundler siêu tốc giúp hot-reload mượt mà.
- **Tailwind CSS**: Framework utility-first để styling nhanh và responsive.
- **Lucide React**: Thư viện icon đa dạng, nhẹ nhàng.

### ⚙️ Backend
- **Java Spring Boot**: Bộ khung chính của RESTful API.
- **Spring Data JPA / Hibernate**: ORM tương tác với MySQL.
- **Spring Web / MVC**: Xử lý HTTP Request/Response.
- **MapStruct**: Mapping Entity sang DTO và ngược lại tiện lợi.
- **Lombok**: Giảm mã boilerplate của Java (Getters, Setters, Builders).

---

🚀 **Chúc bạn phát triển và chạy thử dự án thành công!** Nếu có thắc mắc trong quá trình khởi chạy, vui lòng kiểm tra lại log Console hoặc cấu hình `application.properties`.
