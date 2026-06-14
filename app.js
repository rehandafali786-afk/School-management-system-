// ---- Storage helpers ----
const db = {
  get: (k) => JSON.parse(localStorage.getItem(k) || "[]"),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

let students = db.get("students");
let teachers = db.get("teachers");
let classes  = db.get("classes");
let attendance = JSON.parse(localStorage.getItem("attendance") || "{}");

const save = () => {
  db.set("students", students);
  db.set("teachers", teachers);
  db.set("classes", classes);
  localStorage.setItem("attendance", JSON.stringify(attendance));
};

// ---- Tab navigation ----
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    renderAll();
  });
});

// ---- Helpers ----
const className = (id) => (classes.find((c) => c.id === id) || {}).name || "—";
const teacherName = (id) => (teachers.find((t) => t.id === id) || {}).name || "—";

function fillSelect(el, items, placeholder) {
  el.innerHTML = `<option value="">${placeholder}</option>` +
    items.map((i) => `<option value="${i.id}">${i.name}</option>`).join("");
}

// ---- Students ----
document.getElementById("studentForm").addEventListener("submit", (e) => {
  e.preventDefault();
  students.push({
    id: uid(),
    name: studentName.value.trim(),
    roll: studentRoll.value,
    classId: studentClass.value,
  });
  save();
  e.target.reset();
  renderStudents();
  renderDashboard();
});

function renderStudents() {
  fillSelect(document.getElementById("studentClass"), classes, "Select class");
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = students.map((s) => `
    <tr>
      <td>${s.name}</td><td>${s.roll}</td><td>${className(s.classId)}</td>
      <td><button class="del" onclick="delStudent('${s.id}')">Delete</button></td>
    </tr>`).join("");
}
window.delStudent = (id) => {
  students = students.filter((s) => s.id !== id);
  save(); renderStudents(); renderDashboard();
};

// ---- Teachers ----
document.getElementById("teacherForm").addEventListener("submit", (e) => {
  e.preventDefault();
  teachers.push({ id: uid(), name: teacherName.value.trim(), subject: teacherSubject.value.trim() });
  save();
  e.target.reset();
  renderTeachers();
  renderDashboard();
});

function renderTeachers() {
  const tbody = document.querySelector("#teacherTable tbody");
  tbody.innerHTML = teachers.map((t) => `
    <tr>
      <td>${t.name}</td><td>${t.subject}</td>
      <td><button class="del" onclick="delTeacher('${t.id}')">Delete</button></td>
    </tr>`).join("");
}
window.delTeacher = (id) => {
  teachers = teachers.filter((t) => t.id !== id);
  save(); renderTeachers(); renderDashboard();
};

// ---- Classes ----
document.getElementById("classForm").addEventListener("submit", (e) => {
  e.preventDefault();
  classes.push({ id: uid(), name: className_input().trim(), teacherId: classTeacher.value });
  save();
  e.target.reset();
  renderClasses();
  renderDashboard();
});
const className_input = () => document.getElementById("className").value;

function renderClasses() {
  fillSelect(document.getElementById("classTeacher"), teachers, "Select teacher");
  const tbody = document.querySelector("#classTable tbody");
  tbody.innerHTML = classes.map((c) => `
    <tr>
      <td>${c.name}</td><td>${teacherName(c.teacherId)}</td>
      <td><button class="del" onclick="delClass('${c.id}')">Delete</button></td>
    </tr>`).join("");
}
window.delClass = (id) => {
  classes = classes.filter((c) => c.id !== id);
  save(); renderClasses(); renderStudents();
};

// ---- Attendance ----
document.getElementById("loadAttendance").addEventListener("click", renderAttendance);
document.getElementById("saveAttendance").addEventListener("click", () => {
  const key = attKey();
  if (!key) return alert("Select a class and date first.");
  const checks = document.querySelectorAll("#attendanceTable input[type=checkbox]");
  const record = {};
  checks.forEach((c) => (record[c.dataset.id] = c.checked));
  attendance[key] = record;
  save();
  alert("Attendance saved.");
});

const attKey = () => {
  const cls = document.getElementById("attClass").value;
  const date = document.getElementById("attDate").value;
  return cls && date ? `${cls}_${date}` : "";
};

function renderAttendance() {
  fillSelect(document.getElementById("attClass"), classes, "Select class");
  const cls = document.getElementById("attClass").value;
  const tbody = document.querySelector("#attendanceTable tbody");
  if (!cls) { tbody.innerHTML = ""; return; }
  const key = attKey();
  const saved = attendance[key] || {};
  const list = students.filter((s) => s.classId === cls);
  tbody.innerHTML = list.length ? list.map((s) => `
    <tr>
      <td>${s.name}</td><td>${s.roll}</td>
      <td><input type="checkbox" data-id="${s.id}" ${saved[s.id] ? "checked" : ""}></td>
    </tr>`).join("") : `<tr><td colspan="3">No students in this class.</td></tr>`;
}

// ---- Dashboard ----
function renderDashboard() {
  document.getElementById("countStudents").textContent = students.length;
  document.getElementById("countTeachers").textContent = teachers.length;
  document.getElementById("countClasses").textContent = classes.length;
}

// ---- Init ----
function renderAll() {
  renderStudents();
  renderTeachers();
  renderClasses();
  fillSelect(document.getElementById("attClass"), classes, "Select class");
  renderDashboard();
}
document.getElementById("attDate").valueAsDate = new Date();
renderAll();
