const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// Cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const cardTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const bucket = document.querySelector('.cart-count');
const deleteAll = document.querySelector('.my-own-btn button');

const getGoods = async function(){
	const result = await fetch('../db/db.json');
	if(!result.ok){
		throw "Error" + result.status;
	} return await result.json();
}

const cart = {
	cartGoods: [
		{
			id: '100',
			price: 100,
			name: 'something',
			count: 2,
		}
	],
	renderCart(){
		cardTableGoods.textContent = '';
		this.cartGoods.forEach(({id,name,price,count}) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
					<td>${name}</td>
					<td>${price}$</td>
					<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
					<td>${count}</td>
					<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
					<td>${price * count}$</td>
					<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
			cardTableGoods.append(trGood);
		}) 
		const totalPrice = this.cartGoods.reduce((sum, el) => {
			return sum + el.price * el.count;
		}, 0);
		cardTableTotal.textContent = `${totalPrice}$`;
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(el => id != el.id);
		this.renderCart();
		bucket.textContent = this.cartGoods.length;
	},
	minusGood(id){
		for( const item of this.cartGoods){
			if(item.id == id ){
				if(item.count <= 1){
					this.deleteGood(id)
				}else{
					item.count--;
					break;
				}
			}
		}
		this.renderCart();
	},
	plusGood(id){
		for( const item of this.cartGoods){
			if(item.id == id){
				item.count++;
				break;
			}
		}
		this.renderCart();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem){
			this.plusGood(id);
		}else{
			getGoods()
				.then(data => data.find(item => item.id == id))
				.then(({id,name,price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1,
					});
					bucket.textContent = this.cartGoods.length;
				})
		}
	},
	deleteAllItems(){
		this.cartGoods.forEach(el => this.deleteGood(el.id));
	}
}

body.addEventListener('click', e => {
	const addToCart = e.target.closest('.add-to-cart');
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id)
	}
})

cardTableGoods.addEventListener('click', e => {
	const target = e.target;
	if(target.classList.contains('cart-btn-delete')){
		cart.deleteGood(target.dataset.id);
	} 
	if(target.classList.contains('cart-btn-minus')){
		cart.minusGood(target.dataset.id);
	} 
	if(target.classList.contains('cart-btn-plus')){
		cart.plusGood(target.dataset.id);
	} 
})

deleteAll.addEventListener('click', () => cart.deleteAllItems())

const openModal = () => {
	modalCart.classList.add('show');
	cart.renderCart();
};

const closeModal = () => {
		modalCart.classList.remove('show');
};

const closeModalx2 = (e) => {
	if(e.target.id === 'modal-cart')
		modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', closeModalx2);
modalClose.addEventListener('click', closeModal);

// Scroll smooth

const scrollLinks = document.querySelectorAll('a.scroll-link');

{
	for(scrollLink of scrollLinks){
		scrollLink.addEventListener('click', (e) => {
			e.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: "smooth",
				block: 'start'
			})
		})
	}
}

// Goods

const more = document.querySelector('.more');
const navigationLink= document.querySelectorAll('.navigation-link');
const longGoodsList= document.querySelector('.long-goods-list');

const createCard = ({ id, description, price, label, img, name }) => {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>`
		return card;
};

const renderCards = (data) => {
	longGoodsList.innerHTML = '';
	const cards = data.map(createCard);
	longGoodsList.append(...cards)

	document.body.classList.add('show-goods')
};

// Функция плавной прокрутки 
const smoothScrolling = () => {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	})
}

more.addEventListener('click', (e) => {
	e.preventDefault();
	getGoods().then(renderCards);
	// Плавная прокрутка вверх
	smoothScrolling();
})



const filterCards = (field,value) =>{
	getGoods().then((data) => {
		// Добавление на All
		if(value === 'All') 
			return data.map((good) => good);
		return data.filter((good) => good[field] === value);
	})
	.then(renderCards);
}

navigationLink.forEach((link) => 
	link.addEventListener('click', (e) => {
		e.preventDefault();
		const field = link.dataset.field;
		let value = link.textContent;
		filterCards(field, value);
}))

// Добавление на View all

const viewAll = document.querySelectorAll('.special-offers .button');

viewAll.forEach((el, index) => {
	el.addEventListener('click', () => {
		if(el.className === 'button'){
			if(index === 0) filterCards('category', 'Accessories');
			if(index === 1) filterCards('category', 'Clothing');
			smoothScrolling();
		}
	})
})

// Server

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php',{
	method: 'POST',
	body: dataUser,
})

// Проверяем валидность формы 
const validInput = () => {
	const modalInput = document.querySelectorAll('.modal-input');
	let valid = 0;
	modalInput.forEach(input => {
		if(input.value.trim() !== '')
			valid += 1;
	})
	return valid ? true : false;
}

modalForm.addEventListener('submit', e => {
	e.preventDefault();

	const formData = new FormData(modalForm); // почитать самому!
	formData.append('cart', JSON.stringify(cart.cartGoods))
	const valid = validInput();

	if(cart.cartGoods.length && valid){ //  сама проверка
		postData(formData)
		.then(response => {
			if(!response.ok){
				throw new Error(response.status)
			}else{
				console.log("Успешно!");
			}
		})
		.catch(err => console.error(err))
		.finally(() => {
			closeModal();
			modalForm.reset();
			cart.deleteAllItems();
		})
	}
})