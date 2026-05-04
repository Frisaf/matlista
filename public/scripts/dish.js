function removeDish(id) {
    const choice = confirm("Är du säker på att du vill ta bort den här maträtten? DU KAN INTE ÅNGRA DETTA BESLUT!")

    if (choice) {
        window.location.replace(`/dishes/delete/${id}`)
    }
}