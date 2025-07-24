const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const alertSound = document.getElementById('alertSound');
const calendarEl = document.getElementById('calendar');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let calendar;

// บันทึกข้อมูลเวลาเรียนลง localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// แสดงรายการเวลาเรียนพร้อมปุ่มลบ
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = `${task.subject} - ${new Date(task.dateTime).toLocaleString()}`;

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'ลบ';
    btnDelete.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      updateCalendar();
    };

    li.appendChild(btnDelete);
    taskList.appendChild(li);
  });
}

// แสดงปฏิทิน FullCalendar
function updateCalendar() {
  if (calendar) calendar.destroy();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: tasks.map(task => ({
      title: task.subject,
      start: task.dateTime,
      allDay: false
    }))
  });

  calendar.render();
}

// ตั้งแจ้งเตือนและเล่นเสียงล่วงหน้า 1 นาที
function scheduleNotification(subject, dateTime) {
  if (Notification.permission !== 'granted') return;

  const notifyTime = new Date(dateTime).getTime() - 60000; // 1 นาที ก่อนเวลาเรียน
  const now = Date.now();
  const timeout = notifyTime - now;

  if (timeout > 0) {
    setTimeout(() => {
      new Notification('แจ้งเตือนเวลาเรียน', {
        body: `${subject} กำลังจะเริ่มใน 1 นาที`
      });

      alertSound.play()
        .then(() => console.log('เล่นเสียงแจ้งเตือนแล้ว'))
        .catch(err => console.error('เล่นเสียงแจ้งเตือนไม่ได้:', err));
    }, timeout);
  }
}

// ขออนุญาตเล่นเสียงจากผู้ใช้ครั้งแรกเมื่อคลิกหน้าเว็บ
document.body.addEventListener('click', () => {
  alertSound.play()
    .then(() => {
      alertSound.pause();
      alertSound.currentTime = 0;
      console.log('พร้อมเล่นเสียงแจ้งเตือน');
    })
    .catch(err => {
      console.warn('ยังไม่สามารถเล่นเสียงได้:', err);
    });
}, { once: true });

// ฟอร์มเพิ่มเวลาเรียน
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const subject = document.getElementById('subject').value.trim();
  const dateTime = document.getElementById('dateTime').value;

  if (!subject || !dateTime) {
    alert('กรุณากรอกชื่อวิชาและเวลาให้ครบ');
    return;
  }

  tasks.push({ subject, dateTime });
  tasks.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  saveTasks();
  renderTasks();
  updateCalendar();
  scheduleNotification(subject, dateTime);

  taskForm.reset();
});

// ขอสิทธิ์แจ้งเตือนตอนโหลดหน้า
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// แสดงรายการและปฏิทินตอนเริ่มต้น
renderTasks();
updateCalendar();
