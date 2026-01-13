<template>
  <div class="page-container">
    <div id="gradingList" class="page-content hidden">
      <div class="page-header">
        <h2 class="page-title">
          <i class="fas fa-clipboard-list me-2"></i>รายการงานที่ต้องตรวจ
        </h2>
      </div>

      <div class="row mb-3">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-primary mb-1">12</h3>
              <small class="text-muted">รอตรวจ</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-success mb-1">45</h3>
              <small class="text-muted">ตรวจแล้ว</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-warning mb-1">8</h3>
              <small class="text-muted">ส่งสาย</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-danger mb-1">5</h3>
              <small class="text-muted">ไม่ส่ง</small>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="mb-1">งานทั้งหมดที่ต้องตรวจ</h5>
            <small class="text-muted">เรียงตามวันที่ส่ง (ใหม่สุดก่อน)</small>
          </div>
          <div>
            <select class="form-select" style="width: auto">
              <option value="all">ทุกงาน</option>
              <option value="pending">รอตรวจ</option>
              <option value="graded">ตรวจแล้ว</option>
              <option value="late">ส่งสาย</option>
            </select>
          </div>
        </div>

        <!-- Assignment Group 1 -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">
            <i class="fas fa-tasks me-2"></i>แบบฝึกหัดที่ 1: Variables Exercise
            <span class="badge bg-info ms-2">บทที่ 2</span>
          </h6>

          <div class="submission-card">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  <i class="fas fa-user-circle me-2"></i>สมชาย ใจดี
                  <span class="badge bg-warning text-dark ms-2">รอตรวจ</span>
                </h6>
                <p class="text-muted mb-2">
                  <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 12 ม.ค. 2568 14:30
                  <span class="text-success ms-2">(ส่งตรงเวลา)</span>
                </p>
                <div class="mb-2">
                  <i class="fas fa-file me-1"></i>
                  <a href="#" class="text-primary">variables_exercise.py</a>
                  <span class="text-muted ms-2">(2.3 KB)</span>
                </div>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-primary"
                  onclick="showPage('gradingDetail')"
                >
                  <i class="fas fa-check-circle me-1"></i>ตรวจเลย
                </button>
              </div>
            </div>
          </div>

          <div class="submission-card">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  <i class="fas fa-user-circle me-2"></i>สมศักดิ์ ขยันเรียน
                  <span class="badge bg-warning text-dark ms-2">รอตรวจ</span>
                  <span class="badge bg-danger ms-1">ส่งสาย</span>
                </h6>
                <p class="text-muted mb-2">
                  <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 16 ม.ค. 2568 08:20
                  <span class="text-danger ms-2">(สาย 1 วัน)</span>
                </p>
                <div class="mb-2">
                  <i class="fas fa-file me-1"></i>
                  <a href="#" class="text-primary">assignment_variables.py</a>
                  <span class="text-muted ms-2">(3.1 KB)</span>
                </div>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-primary"
                  onclick="showPage('gradingDetail')"
                >
                  <i class="fas fa-check-circle me-1"></i>ตรวจเลย
                </button>
              </div>
            </div>
          </div>

          <div class="submission-card">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  <i class="fas fa-user-circle me-2"></i>สมหญิง รักเรียน
                  <span class="badge bg-success ms-2">ตรวจแล้ว</span>
                </h6>
                <p class="text-muted mb-2">
                  <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 13 ม.ค. 2568 10:15
                  <span class="text-success ms-2">(ส่งตรงเวลา)</span>
                </p>
                <div class="mb-2">
                  <i class="fas fa-file me-1"></i>
                  <a href="#" class="text-primary">homework1.py</a>
                  <span class="text-muted ms-2">(1.8 KB)</span>
                </div>
                <div class="mt-2">
                  <strong class="text-success">คะแนน: 9.5/10</strong>
                </div>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-outline-primary"
                  onclick="showPage('gradingDetail')"
                >
                  <i class="fas fa-eye me-1"></i>ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignment Group 2 -->
        <div class="mb-4">
          <h6 class="text-muted mb-3">
            <i class="fas fa-tasks me-2"></i>แบบทดสอบที่ 1: Python Basics Quiz
            <span class="badge bg-info ms-2">บทที่ 1</span>
          </h6>

          <div class="submission-card">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  <i class="fas fa-user-circle me-2"></i>สมพร เรียนดี
                  <span class="badge bg-warning text-dark ms-2">รอตรวจ</span>
                </h6>
                <p class="text-muted mb-2">
                  <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 10 ม.ค. 2568 16:45
                  <span class="text-success ms-2">(ส่งตรงเวลา)</span>
                </p>
                <div class="mb-2">
                  <i class="fas fa-file me-1"></i>
                  <a href="#" class="text-primary">quiz1_answers.pdf</a>
                  <span class="text-muted ms-2">(856 KB)</span>
                </div>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-primary"
                  onclick="showPage('gradingDetail')"
                >
                  <i class="fas fa-check-circle me-1"></i>ตรวจเลย
                </button>
              </div>
            </div>
          </div>

          <div class="submission-card">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  <i class="fas fa-user-circle me-2"></i>สมใจ มานะ
                  <span class="badge bg-success ms-2">ตรวจแล้ว</span>
                </h6>
                <p class="text-muted mb-2">
                  <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 10 ม.ค. 2568 14:20
                  <span class="text-success ms-2">(ส่งตรงเวลา)</span>
                </p>
                <div class="mb-2">
                  <i class="fas fa-file me-1"></i>
                  <a href="#" class="text-primary">quiz_python_basics.pdf</a>
                  <span class="text-muted ms-2">(642 KB)</span>
                </div>
                <div class="mt-2">
                  <strong class="text-success">คะแนน: 8.0/10</strong>
                </div>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-outline-primary"
                  onclick="showPage('gradingDetail')"
                >
                  <i class="fas fa-eye me-1"></i>ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script></script>
<style>
:root {
  --primary-blue: #2563eb;
  --light-blue: #dbeafe;
  --dark-blue: #1e40af;
  --bg-gray: #f8fafc;
}
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}
.page-header {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
}

.page-title {
  color: var(--dark-blue);
  font-weight: 600;
  margin: 0;
}
.grade-input {
  width: 100px;
  text-align: center;
  font-weight: 600;
}

.file-upload-area {
  border: 2px dashed var(--primary-blue);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: var(--light-blue);
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload-area:hover {
  background: #bfdbfe;
  border-color: var(--dark-blue);
}

.file-upload-area i {
  font-size: 3rem;
  color: var(--primary-blue);
  margin-bottom: 15px;
}

.badge-custom {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.tab-custom {
  border-bottom: 3px solid transparent;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s;
  color: #64748b;
  font-weight: 500;
}

.tab-custom:hover {
  color: var(--primary-blue);
}

.tab-custom.active {
  color: var(--primary-blue);
  border-bottom-color: var(--primary-blue);
}

.hidden {
  display: none;
}

.content-preview {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
}
</style>
