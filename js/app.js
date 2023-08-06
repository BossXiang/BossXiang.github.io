const face_img = document.getElementById('face')
const counter = document.getElementById('counter')

var happiness = 60

face_img.addEventListener('mouseover', () => {
  if(getRandomNumber(5) == 0) {
    face_img.src = 'assets/img/angry.png';
    happiness -= 3
    counter.textContent = 'Happiness: ' + happiness;
    if(happiness >= 60) counter.style.color = '#23ad00';
    else counter.style.color = '#c90202';
  } else {
    face_img.src = 'assets/img/happy.png';
    happiness += 1
    counter.textContent = 'Happiness: ' + happiness;
    if(happiness >= 60) counter.style.color = '#23ad00';
    else counter.style.color = '#c90202';
  }
})

face_img.addEventListener('mouseout', () => {
  face_img.src = 'assets/img/smile.png';
})


// Helper functions
function getRandomNumber(num) {
  return Math.floor(Math.random() * num);
}
