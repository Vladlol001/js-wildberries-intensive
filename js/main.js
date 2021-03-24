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


const openModal = () => {
	modalCart.classList.add('show');
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

const getGoods = async function(){
	const result = await fetch('../db/db.json');
	if(!result.ok){
		throw "Error" + result.status;
	} return await result.json();
}

const createCard = ({ description, price, label, img, name }) => {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="007">
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
		console.log(field);
		let value = link.textContent;
		console.log(value);
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