const menuItems = document.querySelectorAll(".nav-list li");
const panels = document.querySelectorAll(".panel");

menuItems.forEach((item) => {

    item.addEventListener("click", () => {

        // Menú
        menuItems.forEach((li) => {
            li.classList.remove("active");
        });

        item.classList.add("active");

        // Paneles
        panels.forEach((panel) => {
            panel.classList.remove("active");
        });

        const target = item.querySelector("a").getAttribute("href");

        document.querySelector(target).classList.add("active");

    });

});