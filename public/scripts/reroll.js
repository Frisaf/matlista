function reloadPage() {
    location.reload()
}

filters = document.querySelector(".filters")

function showFilters() {
    filters.style.display = "grid"
}

function closeFilters() {
    filters.style.display = "none"
}

function filterDishes() {
    mainFilters = document.getElementsByClassName("mainFilter")
    sideFilters = document.getElementsByClassName("sideFilter")
}