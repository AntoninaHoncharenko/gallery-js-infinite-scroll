import '../css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createMarkup } from './createMarkup';
import { ApiService } from './APIservice';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { addSimpleLightbox } from './simpleLightbox';

const apiService = new ApiService();

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};
const callback = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      apiService.incrementPage();
      observer.unobserve(entry.target);

      try {
        const { hits, totalHits } = await apiService.fetchImages();

        appendMarkup(hits);

        addSimpleLightbox();

        addObserve();

        notificOnImagesEnd();
      } catch (error) {
        console.log(error);
      }
    }
  });
};

const observer = new IntersectionObserver(callback, options);

refs.form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  apiService.query = event.currentTarget.elements.searchQuery.value.trim();
  refs.form.reset();
  clearMarkup();

  apiService.resetPage();

  if (apiService.searchQuery === '') {
    notificOnErrorFetch();
    return;
  }

  try {
    const { hits, totalHits } = await apiService.fetchImages();

    apiService.calculateTotalPages(totalHits);

    if (hits.length < 1) {
      notificOnErrorFetch();
      return;
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    appendMarkup(hits);

    addObserve();

    addSimpleLightbox();

    notificOnImagesEnd();
  } catch (error) {
    console.log(error.message);
  }
}

function appendMarkup(hits) {
  const markup = createMarkup(hits);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

function notificOnErrorFetch() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    { clickToClose: true }
  );
}

function notificOnImagesEnd() {
  if (apiService.page === apiService.totalPages) {
    Notify.warning(
      'We are sorry, but you have reached the end of search results.'
    );
  }
}

function addObserve() {
  if (apiService.page < apiService.totalPages) {
    const target = document.querySelector('.photo-card:last-child');
    observer.observe(target);
  }
}
