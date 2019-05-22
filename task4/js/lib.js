function Posts() { //модуль для работы с массивом photoPosts

	let postsArr = photoPosts; //переменная postsArr используется в методе getPhotoPosts() для фильрации
	
	let startPosition = 0; //количество постов, которые нужно пропустить, используется как значение по умолчанию для метода getPhotoPosts()
	
	let quantity = 10; //количество постов, которые нужно получить, используется как значение по умолчанию для метода getPhotoPosts()
	
	let filterCfg = {author: 'all', createdAt: 'all'}; //значение по умолчанию для метода getPhotoPosts(), используется при фильрации
	
	return {
		
		getPhotoPosts: function(skip = startPosition, top = quantity, filterConfig = filterCfg) { //получить массив постов
		
			if (photoPosts.length == 0) return false; //если в массиве photoPosts постов нет, возвращает false
			
			startPosition = startPosition + quantity; //задается новое количество постов, которые нужно пропустить
			
			if (filterConfig.author != "all" || filterConfig.createdAt != "all") {
				if (filterConfig.author != "all" && filterConfig.createdAt === undefined) { //фильтрация по автору
					postsArr = photoPosts.filter(function(pst){return pst.author == filterConfig.author});
				}
				else if (filterConfig.author === undefined && filterConfig.createdAt != "all") { //фильтрация по дате
					postsArr = photoPosts.filter(function(pst){return pst.createdAt.getTime() == filterConfig.createdAt.getTime()});
				}
				else { //фильтрация по автору и дате
					postsArr = photoPosts.filter(function(pst){return pst.author == filterConfig.author && pst.createdAt.getTime() == filterConfig.createdAt.getTime()});
				}
				if (postsArr.length == 0) { //если при фильтрации ничего не выбрано, возвращает false
					postsArr = photoPosts;
					return false;
				}
			}
			
			var arr = postsArr.sort(function(a,b){return b.createdAt > a.createdAt ? 1 : -1;}).slice(skip, skip + top); //сортировка по дате и выбор заданного количества постов
			
			if (arr.length == 0) { //если постов выбрано не было, запускает метод getPhotoPosts() со значениями по умолчанию
				startPosition = 0;
				return this.getPhotoPosts();
			}
			return arr;
		},
		
		getPhotoPost: function(id) { //получает пост из массива photoPosts с определенным id
			for (let i = 0; i < photoPosts.length; i++) {
				if (photoPosts[i]["id"] === id) {
					return photoPosts[i];
				}
			}
			return false;
		},
		
		validatePhotoPost: function(obj = {}) { //проверяет пост на присутствие всех обязательных полей в нужном формате 
			if (!obj.hasOwnProperty("descriprion") || !obj.hasOwnProperty("createdAt") || !obj.hasOwnProperty("author") || !obj.hasOwnProperty("photoLink")) return false;
			if (typeof obj.descriprion == "string" && typeof obj.author == "string" && typeof obj.photoLink == "string" && obj.createdAt instanceof Date) 
			{
				return true;
			}
			else {
				return false;
			}
		},
		
		addPhotoPost: function(obj = {}) { //добавляет новый пост в массив photoPosts
		
			if (this.validatePhotoPost(obj)) { //валидация поста перед добавлением
			
				if (photoPosts.length == 0) { //генерация id, если массив пустой
					obj.id = '1';
				}
				else { //генерация id, если в массиве уже есть элементы
					let addArr = photoPosts.slice(0);
					addArr.sort(function(a,b){return parseInt(b.id) > parseInt(a.id) ? 1 : -1;});
					let maxval = parseInt(addArr[0].id)+1;
					obj.id = maxval.toString();
					addArr.length = 0;
				}
				
				let oldLength = photoPosts.length; // сохранение старой длины массива для проверки, был ли довавлен пост
				
				let newLength = photoPosts.push(obj); //добавление поста в массив
				
				if (newLength > oldLength) { //проверка, был ли довавлен пост в массив, если да, то возвращает true, иначе возвращает false
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		},
		
		editPhotoPost: function(id, obj = {}) { //изменяет пост в массиве photoPosts по id
		
			if (Object.keys(obj).length == 0) return false; //проверяет, что методу передан не пустой объект, в котором должна содержаться информация для изменения поста
			
			let post = this.getPhotoPost(id); //получает пост из массива
			
			if (!post) return post; //если поста, соответсвующего заданному id, нет, возвращает false
			
			let index = photoPosts.indexOf(post); //получает индекс поста в массиве
			
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
			
			if (this.validatePhotoPost(post)) { //валидация поста перед изменением массива
				
				let edit = photoPosts.splice(index, 1, post) //замена поста в массиве новым
				
				if (!edit) { //проверка, был ли заменен пост в массиве, если да, то возвращает true, иначе возвращает false
					return edit;
				}
				else {
					return true;
				}
			}
			else {
				return false;
			}
		},
		
		removePhotoPost: function(id) { //удаление поста из массива photoPosts по id
			
			let post = this.getPhotoPost(id); //получает пост из массива
			
			if (!post) return post; //если поста, соответсвующего заданному id, нет, возвращает false
			
			let index = photoPosts.indexOf(post); //получает индекс поста в массиве
			
			let remove = photoPosts.splice(index, 1); //удаляет пост из массива
			
			if (!remove) { //проверка, был ли удален пост, если да, то возвращает true, иначе возвращает false
				return remove;
			}
			else {
				return true;
			}
		}
	};
}