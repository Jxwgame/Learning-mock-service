<template>
  <div class="page-container">
    <div id="gradingDetail" class="page-content hidden">
      <div class="page-header">
        <h2 class="page-title">
          <i class="fas fa-clipboard-check me-2"></i>ตรวจและให้คะแนน
        </h2>
      </div>

      <div class="editor-section">
        <div class="row">
          <div class="col-md-8">
            <div class="mb-4">
              <h5>แบบฝึกหัดที่ 1: Variables Exercise</h5>
              <h6 class="text-muted">นักเรียน: สมชาย ใจดี</h6>
              <p class="text-muted mb-0">
                <i class="fas fa-clock me-1"></i>ส่งเมื่อ: 12 ม.ค. 2568 14:30
                <span class="badge bg-success ms-2">ส่งตรงเวลา</span>
              </p>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-light">
                <h6 class="mb-0">
                  <i class="fas fa-file-code me-2"></i>ไฟล์ที่ส่ง
                </h6>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="fas fa-file-code fa-2x text-primary me-3"></i>
                  <div class="flex-grow-1">
                    <h6 class="mb-0">variables_exercise.py</h6>
                    <small class="text-muted">2.3 KB</small>
                  </div>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-download me-1"></i>ดาวน์โหลด
                  </button>
                </div>

                <div
                  class="bg-light p-3 rounded"
                  style="font-family: monospace; font-size: 0.9rem"
                >
                  <pre class="mb-0">
# Variables Exercise
# Student: สมชาย ใจดี

# Integer variable
age = 20
print("อายุ:", age)

# Float variable
height = 175.5
print("ส่วนสูง:", height, "cm")

# String variable
name = "สมชาย ใจดี"
print("ชื่อ:", name)

# Boolean variable
is_student = True
print("เป็นนักเรียนหรือไม่:", is_student)</pre
                  >
                </div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-light">
                <h6 class="mb-0">
                  <i class="fas fa-comment-dots me-2"></i>คำติชมและให้คะแนน
                </h6>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">คะแนน</label>
                  <div class="input-group" style="max-width: 200px">
                    <input
                      type="number"
                      class="form-control grade-input"
                      value="8.5"
                      min="0"
                      max="10"
                      step="0.5"
                    />
                    <span class="input-group-text">/ 10</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">คำติชม</label>
                  <textarea
                    class="form-control"
                    rows="5"
                    placeholder="เขียนคำติชมให้กับนักเรียน..."
                  >
โค้ดเขียนได้ดีมาก ใช้ตัวแปรครบทุกประเภท และมีความชัดเจน 

จุดที่ควรปรับปรุง:
- ควรเพิ่มคำอธิบายในโค้ดให้มากขึ้น
- ลองใช้ f-string สำหรับการ print เพื่อความสวยงาม

คะแนน: 8.5/10</textarea
                  >
                </div>

                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>เกณฑ์การให้คะแนน:</strong>
                  <ul class="mb-0 mt-2">
                    <li>ใช้ตัวแปรครบ 4 ประเภท (4 คะแนน)</li>
                    <li>แสดงผลถูกต้อง (3 คะแนน)</li>
                    <li>ตั้งชื่อตัวแปรที่มีความหมาย (2 คะแนน)</li>
                    <li>โค้ดเป็นระเบียบ (1 คะแนน)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button
                class="btn btn-outline-secondary"
                onclick="showPage('gradingList')"
              >
                <i class="fas fa-arrow-left me-2"></i>กลับ
              </button>
              <button class="btn btn-success" onclick="saveGrade()">
                <i class="fas fa-save me-2"></i>บันทึกคะแนน
              </button>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card mb-3">
              <div class="card-body">
                <h6 class="card-title">ข้อมูลนักเรียน</h6>
                <hr />
                <p><strong>ชื่อ:</strong><br />สมชาย ใจดี</p>
                <p><strong>รหัสนักเรียน:</strong><br />STD001</p>
                <p><strong>อีเมล:</strong><br />somchai@example.com</p>
              </div>
            </div>

            <div class="card">
              <div class="card-body">
                <h6 class="card-title">ประวัติการส่งงาน</h6>
                <hr />
                <small class="text-muted">
                  <i class="fas fa-check-circle text-success me-1"></i>
                  ส่งงานครบ 5/5 ครั้ง<br />
                  <i class="fas fa-clock text-warning me-1"></i>
                  ส่งตรงเวลา 4/5 ครั้ง<br />
                  <i class="fas fa-chart-line text-primary me-1"></i>
                  คะแนนเฉลี่ย: 8.2/10
                </small>
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
