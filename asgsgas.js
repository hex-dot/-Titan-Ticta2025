if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const alertSound = document.getElementById('alertSound');

taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const subject = document.getElementById('subject').value.trim();
  const dateTime = document.getElementById('dateTime').value;

  if (!subject || !dateTime) return;

  // แสดงรายการในหน้าจอ
  const li = document.createElement('li');
li.textContent = `${subject} - ${new Date(dateTime).toLocaleString()} `;

// ปุ่มลบ
const delBtn = document.createElement('button');
delBtn.textContent = 'ลบ';
delBtn.style.marginLeft = '10px';
delBtn.onclick = () => {
  taskList.removeChild(li);
};

li.appendChild(delBtn);
taskList.appendChild(li);

  // ตั้งเวลาแจ้งเตือน
  const taskTime = new Date(dateTime).getTime();
  const now = Date.now();
  const timeout = taskTime - now;

  if (timeout > 0) {
    setTimeout(() => {
      notify(`${subject} ถึงเวลาเรียนแล้ว!`);
    }, timeout);
  } else {
    alert("เวลาที่ตั้งไว้ต้องมากกว่าปัจจุบัน");
  }

  taskForm.reset();
});

function notify(message) {
  if (Notification.permission === 'granted') {
    new Notification(message);
    alertSound.play().catch(e => console.log('ไม่สามารถเล่นเสียงได้:', e));
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(message);
        alertSound.play().catch(e => console.log('ไม่สามารถเล่นเสียงได้:', e));
      }
    });
  }
}