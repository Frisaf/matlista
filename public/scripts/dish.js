function removeDish(id) {
    const choice = confirm("Är du säker på att du vill ta bort den här maträtten? DU KAN INTE ÅNGRA DETTA BESLUT!")

    if (choice) {
        window.location.replace(`/dishes/delete/${id}`)
    }
}

function editDish(id) {
    window.location.replace(`/dishes/edit/${id}`)
}

function invalidInput(textbox) {
    if (textbox.value === "") {
        textbox.style.border = "3px solid red"
        textbox.setCustomValidity("Vänligen fyll i det här fältet")
    } else {
        textbox.style.border = "unset"
        textbox.setCustomValidity("")
    }

    return true
}