import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import axios from 'axios';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/style.css';

const form = document.querySelector(`.search-form`);
const gallery = document.querySelector(`.gallery`);
const loadBtn = document.querySelector(`.load-more`)

const lightboxGallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: `img`,
  captionType: `attr`,
  captionPosition: `bottom`,
  captionsData: `alt`,
  captionDelay: 250,
});

form.addEventListener(`submit`, onSubmit)
loadBtn.addEventListener(`click`, onLoadBtnClick);

const URL_BASE = `https://pixabay.com/api/`;
const URL_KEY = `35918866-0b9867c5c5e6a777413a575db`;
const params = `image_type=photo&per_page=40&orientation=horizontal&safesearch=true`;
let data = ``;
let pageNumber = ``;



async function onSubmit(evt) {
  evt.preventDefault();
  pageNumber = 1;
  data = new FormData(evt.target).get(`searchQuery`).trim();
  loadBtn.hidden = true;
  if (!data) {
    Notiflix.Notify.warning('Введи слово для пошуку!');
    return;
 }
  try {
    const response = await axios.get(
      `${URL_BASE}?key=${URL_KEY}&q=${data}&${params}&page=${pageNumber}`
    );
    if (!response.data.total) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    renderAfterSubmit(response);
  } catch (error) {
    console.error(error);
    Notiflix.Notify.info(
      `Ops! Try again later!`
    );
  }
  return data;
}

function renderAfterSubmit(response) {
  gallery.innerHTML = ``;
  response.data.hits.map(img => { 
    gallery.insertAdjacentHTML(`beforeend`, createMarkup(img));
  });
  
  smoothScroll();
  if (response.data.hits.length < 40) {
    return;
  }
  loadBtn.hidden = false;
}

async function onLoadBtnClick() {
  pageNumber += 1;
  try {
    const response = await axios.get(
      `${URL_BASE}?key=${URL_KEY}&q=${data}&${params}&page=${pageNumber}`
    );
    if (!response.data.total) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    renderAfterLoadBtnClick(response);
    console.log(response)
  } catch (error) {
    console.error(error);
    Notiflix.Notify.info(`Ops! Try again later!`);
  }
}

function renderAfterLoadBtnClick(response) {
  response.data.hits.map(img => {
    gallery.insertAdjacentHTML(`beforeend`, createMarkup(img));
  })
  smoothScroll();
  lightboxGallery.refresh();
  if (response.data.hits.length < 40) {
    loadBtn.hidden = true;
    Notiflix.Notify.info(
      `"We're sorry, but you've reached the end of search results."`
    );
  }
}



function createMarkup({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) {
  return `<a href="${largeImageURL}" class="wrapper"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="370px"/>
  <div class="info">
    <p class="info-item">
      <b>Likes <span class="info-item__span">${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views <span class="info-item__span">${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments <span class="info-item__span">${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads <span class="info-item__span">${downloads}</span></b>
    </p>
  </div>
</div></a>`;
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}