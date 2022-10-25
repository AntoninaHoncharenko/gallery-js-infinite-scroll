export function createMarkup(hits) {
  return hits
    .map(({ largeImageURL, webformatURL, tags }) => {
      return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
</div>`;
    })
    .join('');
}
