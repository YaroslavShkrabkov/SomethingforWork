class Posts { //объект для работы с массивом photoPosts

	_startPosition = 0 //количество постов, которые нужно пропустить, используется как значение по умолчанию для метода getPage()
	
	quantity = 10 //количество постов, которые нужно получить, используется как значение по умолчанию для метода getPage()
	
	filterCfg = {author: 'all', createdAt: 'all'} //значение по умолчанию для метода getPage(), используется при фильрации
	
	_postsColl = new Map() //коллекция постов
	
	_notValid = [] //массив постов, не прошедших валидацию
	
	photoPostsSize = 0

	setStartPosition(val = 0) {
		
		this._startPosition = val;
		
		return this._startPosition;
	}
	
	static _validate(obj = {}) { //проверяет пост на присутствие всех обязательных полей в нужном формате
	
		if (!obj.hasOwnProperty("description") || !obj.hasOwnProperty("createdAt") || !obj.hasOwnProperty("author") || !obj.hasOwnProperty("photoLink")) return false;
		
		if (typeof obj.description == "string" && typeof obj.author == "string" && typeof obj.photoLink == "string") {
			
			return true;
		}
		else {
			
			return false;
		}
	}

	restore(coll) { //добавляет посты из массива в коллекцию
	
		for (let i = 0; i < coll.length; i++) {
			
			if (Posts._validate(coll[i])) { //валидация поста перед добавлением в коллекцию
			
				coll[i]["createdAt"] = new Date(coll[i]["createdAt"]);
			
				this._postsColl.set(coll[i]["id"], coll[i]);
			}
			else {
				
				this._notValid.push(coll[i]);
			}		
		}
		
		return this._notValid;
	}
	
	save() {
		
		let postsArr = this._getPosts();
		
		localStorage.setItem("photoPosts", JSON.stringify(postsArr));
		
		control.mainPage();
	}
	
	_getPosts() {
				
		let postsArr = []; //массив из коллекции, используется для фильрации и сортировки
		
		for (let elem of this._postsColl.values()) { //создает массив из коллекции
		
			postsArr.push(elem);
		}
		
		if (postsArr.length == 0) {
			
			return false; //если постов нет, возвращает false
		}
		else {
			
			return postsArr; //если посты есть, возвращает массив
		}
	}
	
	filter(field) { //выбирает авторов или даты из коллекции постов для вывода их на главном экране в блоке "Фильтр"
		
		let filterArr = [];
		
		let postsArr;

		if (!(postsArr = this._getPosts())) return false;
		
		for (let i = 0; i < postsArr.length; i++) {
			
			if (filterArr.indexOf(postsArr[i][field].toString()) == -1) filterArr.push(postsArr[i][field].toString());
		}
		
		return filterArr;
	}

	getPage(filterConfig = this.filterCfg, skip = this._startPosition, top = this.quantity) { //получение постов
		
		this.filterCfg = filterConfig;
		
		let postsArr;
		
		if (!(postsArr = this._getPosts())) return false;
		
		this._startPosition = this._startPosition + this.quantity; //задается новое количество постов, которые нужно пропустить
		
		if (filterConfig.author != "all" || filterConfig.createdAt != "all") {
			
			if (filterConfig.author != "all" && filterConfig.createdAt == "all") { //фильтрация по автору
			
				postsArr = postsArr.filter(function(pst){return pst.author == filterConfig.author});
			}
			else if (filterConfig.author == "all" && filterConfig.createdAt != "all") { //фильтрация по дате
			
				postsArr = postsArr.filter(function(pst){return view.formatDate(pst.createdAt) == filterConfig.createdAt});
			}
			else { //фильтрация по автору и дате
			
				postsArr = postsArr.filter(function(pst){return pst.author == filterConfig.author && view.formatDate(pst.createdAt) == filterConfig.createdAt});
			}
			if (postsArr.length == 0) { //если при фильтрации ничего не выбрано, возвращает false
			
				return false;
			}
		}
		
		this.photoPostsSize = postsArr.length;
		
		let arr = postsArr.sort(function(a,b){return b.createdAt > a.createdAt ? 1 : -1;}).slice(skip, skip + top); //сортировка по дате и выбор заданного количества постов
		
		return arr;
	}
	
	get(id) { //получает пост с определенным id
	
		let post;
		
		if (post = this._postsColl.get(id)) {
			
			return post;
		}
		else {
			
			return false;
		}
	}
	
	add(obj = {}) { //добавляет новый пост
	
		if (Posts._validate(obj)) { //валидация поста перед добавлением
			
			if (this._postsColl.size == 0) { //генерация id, если коллекция пуста
			
				obj.id = '1';
			}
			else { //генерация id, если в коллекции уже есть элементы
			
				let keysArr = []; //массив ключей коллекции
	
				for(let key of this._postsColl.keys()) { //создает массив из ключей коллекции
				
					keysArr.push(key);
				}
				
				keysArr.sort(function(a,b){return parseInt(b.id) > parseInt(a.id) ? 1 : -1;});
				
				let maxval = parseInt(keysArr[0])+1;
				
				obj.id = maxval.toString();
				
				keysArr.length = 0;
			}
			
			let oldSize = this._postsColl.size; // сохранение старого размера коллекции для проверки, был ли довавлен пост
			
			this._postsColl.set(obj.id, obj); //добавление поста
			
			let newSize = this._postsColl.size; //новый размер коллекции
			
			if (newSize > oldSize) { //проверка, был ли довавлен пост, если да, то возвращает true, иначе возвращает false
			
				return true;
			}
			else {
				
				return false;
			}
		}
		else {
			
			return false;
		}
	}
	
	edit(id, obj = {}) { //изменяет пост с указанным id
	
		if (Object.keys(obj).length == 0) return false; //проверяет, что методу передан непустой объект, в котором должна содержаться информация для изменения поста
		
		let post = this.get(id); //получает пост из массива
		
		if (!post) return post; //если поста, соответсвующего заданному id, нет, возвращает false
		
		let keysObj = Object.keys(obj); //получает список полей объекта, переданного методу для замены поста
		
		try { //вносит изменеия в пост, если сделать этого не удалось, возвращает false
		
			for (let i = 0; i < keysObj.length; i++ ) {
				
				if (keysObj[i] != "id" && keysObj[i] != "createdAt" && keysObj[i] != "author") {
					
					post[keysObj[i]] = obj[keysObj[i]];
				}
			}
		}
		catch {
			
			return false;
		}
		
		if (Posts._validate(post)) { //валидация поста перед изменением массива
			
			this.remove(id); //удаляет прежнюю версию поста
			
			if (this._postsColl.set(id, post)) { //добавляет новую версию поста; проверяет, был ли заменен пост в массиве, если да, то возвращает true, иначе возвращает false
				
				return true;
			}
			else {
				
				return false;
			}
		}
		else {
			
			return false;
		}
	}
	
	remove(id) { //удаление поста по id
	
		return this._postsColl.delete(id);
	}
};

class View {
	
	formatDate(date) {
		
		let str = "";
		
		(date.getDate() < 10) ? str = "0"+date.getDate() : str = ""+date.getDate();
		
		(date.getMonth() < 9) ? str += ".0"+(date.getMonth()+1) : str += "."+(date.getMonth()+1);
		
		return str += "."+date.getFullYear();
	}
	
	formatTime(date) {
		
		let str = "";
		
		(date.getHours() < 10) ? str = "0"+date.getHours() : str = ""+date.getHours();
		
		(date.getMinutes() < 10) ? str += ":0"+date.getMinutes() : str += ":"+date.getMinutes();
		
		return str;
	}
	
	feed(user, filterConfig) { //вывод ленты постов в браузере
		
		let elem = document.querySelector(".posts-feed");
		
		let loadPosts; //используется для пагинации
		
		if (loadPosts = document.querySelector("#loadPosts")) elem.removeChild(loadPosts);
		
		let postsArr = posts.getPage(filterConfig);
		
		let str = "";
		
		if (postsArr) {
		
			for (let i = 0; i < postsArr.length; i++) {
				
				let div = document.createElement("div");
				
				str = "<p><i>"+this.formatDate(postsArr[i].createdAt)+" "+this.formatTime(postsArr[i].createdAt)+"</i>Автор: "+postsArr[i].author+"</p>";
				
				str += "<img src='"+postsArr[i].photoLink+"' alt='Фотография'><p>"+postsArr[i].description+"</p>";
				
				if (user == postsArr[i].author) {
					
					str += "<div><div class='buttons'><div></div><div><a data-action='edit' data-id='"+postsArr[i].id+"'>Редактировать</a><a data-action='delete' data-id='"+postsArr[i].id+"'>Удалить</a></div></div></div>";
				}
				
				div.innerHTML = str;
				
				elem.appendChild(div);
			}

			if (postsArr.length == posts.quantity && posts.photoPostsSize > posts.quantity) {
				
				let a = document.createElement("a");
				
				a.innerHTML = "Загрузить ещё";
				
				a.id = "loadPosts"; 
				
				a.onclick = function(){
					
					view.feed(user);
					
					return false;
				}
				
				elem.appendChild(a);
			}
		}
		else {
			
			elem.innerHTML = "<div><strong>Записи отсутствуют.</strong></div>";
		}
	}
	
	showElements(user = "") { //показывает элементы, доступные, если пользователь авторизован
		
		let str = "";
		
		if (user != "") {
			str = "<a data-action='add-form'>Добавить фото</a><ul><li></li><li>"+user+"</li><li data-action='exit'>Выйти</li></ul>";
		}
		else {
			str = "<a style='visibility: hidden'>Добавить фото</a><ul><li data-action='login-form'>Авторизация</li></ul>";
		}
		
		let elem = document.getElementById("headerDiv");
		
		elem.innerHTML = str;
	}
	
	filterAuthor() { //отображение списка аторов в фильтре
		
		let authors = posts.filter("author");
		
		let elem = document.getElementById("authors");
		
		for (let i = 0; i < authors.length; i++) {
			
			let optn = document.createElement("option");
			
			optn.innerHTML = authors[i];
			
			if (authors[i] == posts.filterCfg.author) optn.selected = 1;
			
			elem.appendChild(optn);
		}
	}
	
	filterDate() { //отображение списка дат в фильтре
		
		let dates = posts.filter("createdAt").sort(function(a,b){return parseInt(b) > parseInt(a) ? 1 : -1;});
		
		let datesNew = [];
		
		for (let i = 0; i < dates.length; i++) {
			datesNew.push(this.formatDate(new Date(Date.parse(dates[i]))));
		}
		
		let set = new Set(datesNew);
		
		datesNew = Array.from(set);
		
		let elem = document.getElementById("dates");
		
		for (let i = 0; i < datesNew.length; i++) {
			
			let optn = document.createElement("option");
			
			optn.innerHTML = datesNew[i];
			
			if (datesNew[i] == posts.filterCfg.createdAt) optn.selected = 1;
			
			elem.appendChild(optn);
		}
	}
	
	postsFeed(main) { //создает контейнеры для фильтра и ленты постов
		
		let aside = document.createElement("aside");
		
		let section = document.createElement("section");
		
		aside.innerHTML = "<p>Фильтр</p><form data-action='filter'><select id='authors'><option value='all'>Все авторы</option></select><select id='dates'><option value='all'>Все даты</option></select><input type='submit' data-action='submit' value='Выбрать'></form>";
		
		section.className = "posts-feed";
		
		main.appendChild(aside);
		
		main.appendChild(section);
	}

	screens(name) { //отвечает за экраны авторизации, ошибки и добавления/редактирования постов
		
		if (name == "enter" || name == "error-page") {
			
			let header = document.querySelector("header");
			
			let footer = document.querySelector("footer");
			
			header.className = footer.className = "hidden";
		}
		
		let main = document.querySelector("main");
		
		main.className = name;
		
		switch (name) {
			
			case "enter": main.innerHTML = "<form data-action='enter'><h2>Вход</h2><label for='lgn'>Логин</label><input id='lgn' type='text'><label for='psw'>Пароль</label><input id='psw' type='password'><input type='submit' data-action='submit' value='Войти'><a data-action='show-mp' title='Закрыть'>X</a></form>";;
			break;
			
			case "add-edit": main.innerHTML = "<a data-action='show-mp'>На главную</a><form data-action='change-posts'><input type='hidden' id='id' value=''><input type='hidden' id='lnk' value=''><label for='file' data-action='file'>Выберите файл</label><input type='file' id='file' data-action='input-file'><p>Файл не выбран</p><label for='desc'>Краткое описание</label><textarea id='desc'></textarea><label>Имя автора</label><input type='text' id='author' disabled><label>Дата и время</label><input type='text' id='date' disabled><input type='submit' data-action='submit' value='Отправить'></form>";
			break;
			
			case "error-page": main.innerHTML = "<div><p>Error</p><p>К сожалению, произошла ошибка.</p><a data-action='show-mp'>На главную</a></div>";
			break;
		}
	}
}

class Controller {
	
	constructor() {
		this.mainPage();
	}
	
	mainPage(filterConfig = posts.filterCfg) { //устанавливает пользователя, загружает летну постов, показывает элементы, доступные, если пользователь авторизован
		
		let user = User.getName();
		
		posts.setStartPosition();
		
		posts.restore(JSON.parse(localStorage.getItem("photoPosts"))); //создает коллекцию постов
		
		let header = document.querySelector("header");
		
		let footer = document.querySelector("footer");
		
		let main = document.querySelector("main");
		
		header.className = footer.className = main.className = main.innerHTML = "";
		
		view.postsFeed(main);
		
		view.showElements(user); //показывает элементы, доступные, если пользователь авторизован
		
		view.feed(user, filterConfig); //отображает ленту фотопостов
		
		view.filterAuthor(); //отображение списка аторов в фильтре

		view.filterDate(); //отображение списка дат в фильтре
	}
	
	filteredPage() {
		
		let obj = {};
		
		obj.author = document.getElementById("authors").value;
		
		obj.createdAt = document.getElementById("dates").value;
		
		this.mainPage(obj);
	}
	
	addForm() { //выводит в браузер и заполняет форму добавления постов
		
		view.screens("add-edit");
		
		document.getElementById("author").value = User.getName();
		
		document.getElementById("date").value = view.formatDate(new Date(Date.now()));
	}
	
	editForm(id) { //выводит в браузер и заполняет форму редактирования постов
		
		let post = posts.get(id);
		
		if (!post) {
			
			view.screens("error-page");
		}
		else {
			
			view.screens("add-edit");
			
			document.getElementById("id").value = id;
			
			document.getElementById("lnk").value = post.photoLink;
			
			document.getElementById("file").nextSibling.innerHTML = "<span>Имя файла:</span> "+post.photoLink;
			
			document.getElementById("desc").value = post.description;
			
			document.getElementById("author").value = post.author;
			
			document.getElementById("date").value = view.formatDate(post.createdAt)+" "+view.formatTime(post.createdAt);
		}
	}
	
	changePosts() { //добавляет или изменяет пост
		
		let id = "";
		
		let obj = {};
		
		let plink = document.getElementById("file").value.match(/([^\\]+\.jpg$)|([^\\]+\.jpeg$)|([^\\]+\.png$)/i);
		
		obj.description = document.getElementById("desc").value;
		
		if (plink !== null) {
			
			obj.photoLink = "img/"+plink[0];
		}
		else {
			
			obj.photoLink = "";
		}
				
		if (id = document.getElementById("id").value) {
			
			if (obj.photoLink == "") obj.photoLink = document.getElementById("lnk").value;
			
			if (!posts.edit(id, obj)) {
				
				view.screens("error-page");
			}
			else {
				
				posts.save();
			
				this.mainPage();
			}
		}
		else {
			
			obj.author = document.getElementById("author").value;
			
			obj.createdAt = new Date();
			
			if (!posts.add(obj)) {
				
				view.screens("error-page");
			}
			else {
				
				posts.save();
			
				this.mainPage();
			}
		}
	}
	
	removePost(id) { //удаляет пост
	
		if (confirm("Вы действительно хотите удалить запись?")) {
				
			if (!posts.remove(id)) {
				
				view.screens("error-page");
			}
			else {
				
				posts.save();
			
				this.mainPage();
			}
		}
	}
	
	enter() { //авторизация пользователя в приложении
		
		let lgn = document.getElementById("lgn").value;
		
		let psw = document.getElementById("psw").value;
		
		if (usr.loggin(lgn, psw)) {
			
			this.mainPage();
		}
		else {
			
			if (!document.querySelector("form span")) {
				
				let form = document.querySelector("form");
				
				let span = document.createElement("span");
				
				span.innerHTML = "Вы ввели неверные данные";
				
				form.appendChild(span);
			}
		}		
	}
	
	exit() { //разлогинивание пользователя
		
		usr.loggout();
		
		this.mainPage();
	}
	
	static _inputFile() {
		
		let file = document.getElementById("file");
		
		if (file.value) {
			
			file.nextSibling.innerHTML = "<span>Имя файла:</span> "+file.value;
		}
		else {
			
			file.nextSibling.innerHTML = "Файл не выбран";
		}
	}
	
	doAction(elem) { //делегирование событий
		
		let attr;
		
		if (attr = elem.getAttribute("data-action")) {
			
			switch(attr) {
				
				case "show-mp": control.mainPage();
				break;
				
				case "submit": throw new Error("Не ошибка!!!"); elem.form.submit();
				break;
				
				case "file": throw new Error("Не ошибка!!!");
				break;
				
				case "input-file": Controller._inputFile(); throw new Error("Не ошибка!!!");
				break;
				
				case "enter": control.enter();
				break;
				
				case "filter": control.filteredPage();
				break;
				
				case "add-form": control.addForm();
				break;
				
				case "login-form": view.screens("enter");
				break;
				
				case "exit": control.exit();
				break;
				
				case "edit": control.editForm(elem.dataset.id);
				break;
				
				case "delete": control.removePost(elem.dataset.id);
				break;
				
				case "change-posts": control.changePosts();
				break;
			}
		}
	}
}

class User {
	
	_users = new Map(); //список пользователей
	
	constructor() {
		if (!localStorage.getItem("user")) this.loggout();
	}
		
	_getUsers() { //получение списка пользователей из локального хранилища
		
		let arr = JSON.parse(localStorage.getItem("users"));
		
		for (let i = 0; i < arr.length; i++) {
			this._users.set(arr[i]["login"], arr[i]["password"]);
		}
		return arr;
	}
		
	loggin(lgn, psw) { //авторизация пользователя
		
		this._getUsers();
		
		let pass;
		
		if (pass = this._users.get(lgn)) {
			
			this._users.clear();
			
			if (pass === psw) {
				
				localStorage.setItem("user", lgn);
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}
	
	loggout() { //разлогинивание пользователя
		localStorage.setItem("user", "");
	}
	
	static getName() { //возвращает имя авторизованного пользователя
		return localStorage.getItem("user");
	}
}