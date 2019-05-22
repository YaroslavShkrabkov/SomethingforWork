class Posts { //объект для работы с массивом photoPosts

	_startPosition = 0 //количество постов, которые нужно пропустить, используется как значение по умолчанию для метода getPage()
	
	_quantity = 10 //количество постов, которые нужно получить, используется как значение по умолчанию для метода getPage()
	
	_filterCfg = {author: 'all', createdAt: 'all'} //значение по умолчанию для метода getPage(), используется при фильрации
	
	_postsColl = new Map() //коллекция постов
	
	_notValid = [] //массив постов, не прошедших валидацию

	constructor(coll) { //конструктор, создает коллекцию на основе массива постов
		this._addAll(coll);
	}
	
	setStartPosition(val = 0) {
		this._startPosition = val;
		return this._startPosition;
	}
	
	static _validate(obj = {}) { //проверяет пост на присутствие всех обязательных полей в нужном формате
		if (!obj.hasOwnProperty("descriprion") || !obj.hasOwnProperty("createdAt") || !obj.hasOwnProperty("author") || !obj.hasOwnProperty("photoLink")) return false;
		if (typeof obj.descriprion == "string" && typeof obj.author == "string" && typeof obj.photoLink == "string" && obj.createdAt instanceof Date) 
		{
			return true;
		}
		else {
			return false;
		}
	}

	_addAll(coll) { //добавляет посты из массива в коллекцию
		for (let i = 0; i < coll.length; i++) {
			if (Posts._validate(coll[i])) { //валидация поста перед добавлением в коллекцию
				this._postsColl.set(coll[i]["id"], coll[i]);
			}
			else {
				this._notValid.push(coll[i]);
			}		
		}
		return this._notValid;
	}
	
	_getPosts() {
				
		let postsArr = []; //массив из коллекции, используется для фильрации и сортировки
		
		for(let elem of this._postsColl.values()) { //создает массив из коллекции
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

	getPage(skip = this._startPosition, top = this._quantity, filterConfig = this._filterCfg) { //получение постов
	
		let postsArr;
		
		if (!(postsArr = this._getPosts())) return false;
		
		this._startPosition = this._startPosition + this._quantity; //задается новое количество постов, которые нужно пропустить
		
		if (filterConfig.author != "all" || filterConfig.createdAt != "all") {
			if (filterConfig.author != "all" && filterConfig.createdAt === undefined) { //фильтрация по автору
				postsArr = postsArr.filter(function(pst){return pst.author == filterConfig.author});
			}
			else if (filterConfig.author === undefined && filterConfig.createdAt != "all") { //фильтрация по дате
				postsArr = postsArr.filter(function(pst){return pst.createdAt.getTime() == filterConfig.createdAt.getTime()});
			}
			else { //фильтрация по автору и дате
				postsArr = postsArr.filter(function(pst){return pst.author == filterConfig.author && pst.createdAt.getTime() == filterConfig.createdAt.getTime()});
			}
			if (postsArr.length == 0) { //если при фильтрации ничего не выбрано, возвращает false
				return false;
			}
		}
		
		let arr = postsArr.sort(function(a,b){return b.createdAt > a.createdAt ? 1 : -1;}).slice(skip, skip + top); //сортировка по дате и выбор заданного количества постов
		
		if (arr.length == 0) { //если постов выбрано не было, запускает метод getPage() со значениями по умолчанию
			this._startPosition = 0;
			return this.getPage();
		}
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
	
	_formatDate(date) {
		let str = "";
		(date.getDate() < 10) ? str = "0"+date.getDate() : str = ""+date.getDate();
		(date.getMonth() < 9) ? str += ".0"+(date.getMonth()+1) : str += "."+(date.getMonth()+1);
		return str += "."+date.getFullYear();
	}
	
	_formatTime(date) {
		let str = "";
		(date.getHours() < 10) ? str = "0"+date.getHours() : str = ""+date.getHours();
		(date.getMinutes() < 10) ? str += ":0"+date.getMinutes() : str += ":"+date.getMinutes();
		return str;
	}
	
	feed(user = "") {
		let elem = document.querySelector(".posts-feed");
		let postsArr = posts.getPage();
		let str = "";
		for (let i = 0; i < postsArr.length; i++) {
			let div = document.createElement("div");
			str = "<p><i>"+this._formatDate(postsArr[i].createdAt)+" "+this._formatTime(postsArr[i].createdAt)+"</i>Автор: "+postsArr[i].author+"</p>";
			str += "<img src='"+postsArr[i].photoLink+"' alt='Фотография'><p>"+postsArr[i].descriprion+"</p>";
			if (user == postsArr[i].author) {
				str += "<div><div class='buttons'><div></div><div><a>Редактировать</a><a>Удалить</a></div></div></div>"
			}
			div.innerHTML = str;
			elem.appendChild(div);
		}
	}
	
	showElements(user = "") {
		
		let str = "";
		
		if (user != "") {
			str = "<a>Добавить фото</a><ul><li></li><li>"+user+"</li><li>Выйти</li></ul>";
		}
		else {
			str = "<a style='visibility: hidden'>Добавить фото</a><ul><li>Авторизация</li></ul>";
		}
		
		let elem = document.getElementById("headerDiv");
		
		elem.innerHTML = str;
	}
	
	filterAuthor() {
		
		let authors = posts.filter("author");
		
		let elem = document.getElementById("authors");
		
		for (let i = 0; i < authors.length; i++) {
			let optn = document.createElement("option");
			optn.innerHTML = authors[i];
			elem.appendChild(optn);
		}
	}
	
	filterDate() {
		
		let dates = posts.filter("createdAt").sort(function(a,b){return parseInt(b) > parseInt(a) ? 1 : -1;});
		
		let datesNew = [];
		
		for (let i = 0; i < dates.length; i++) {
			datesNew.push(this._formatDate(new Date(Date.parse(dates[i]))));
		}
		
		let set = new Set(datesNew);
		
		datesNew = Array.from(set);
		
		let elem = document.getElementById("dates");
		
		for (let i = 0; i < datesNew.length; i++) {
			let optn = document.createElement("option");
			optn.innerHTML = datesNew[i];
			elem.appendChild(optn);
		}
	}
}

function loggin(name = "") {
	
	user = name;
	
	posts.setStartPosition();
	
	document.querySelector(".posts-feed").innerHTML = "";
	
	view.showElements(user); //показывает элементы, доступные, если пользователь авторизован
	
	view.feed(user); //отображает ленту фотопостов
	
}

function addPhotoPost(obj = {}) { //добавляет пост и отображает его в списке в браузере

	posts.add(obj);
	
	loggin(user);
}

function editPhotoPost(id, obj = {}) { //изменяет пост в массиве и изменяет его отображение в списке в браузере
	
	posts.edit(id, obj);
	
	loggin(user);
}

function removePhotoPost(id) { //удаляет пост из массива и из списка в браузере

	posts.remove(id);
	
	loggin(user);
}