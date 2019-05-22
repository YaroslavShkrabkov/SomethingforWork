
var usr = new User();

var posts = new Posts(); //создание экземпляра класса Posts

var view = new View(); //создание экземпляра класса View

var control = new Controller(); //создание экземпляра класса Controller

document.body.addEventListener('click', function(evnt){elem = evnt.target; control.doAction(elem); event.preventDefault()},false);

document.body.addEventListener('change',function(evnt){elem = evnt.target; control.doAction(elem);},false);

document.body.addEventListener('submit',function(evnt){elem = evnt.target; control.doAction(elem); event.preventDefault()},false);