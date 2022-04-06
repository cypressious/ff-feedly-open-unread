const observer = new MutationObserver(() => {
    const parent = document.getElementsByClassName('actions-container');

    if (parent.length && !parent[0].querySelector('.open-unread')) {
        addButton(parent[0]);
    }
});

function addButton(parent) {
    const button = document.createElement('button');
    button.classList.add('secondary', 'open-unread');
    button.innerHTML = 'Open unread';
    button.onclick = open;

    parent.insertBefore(button, parent.firstChild)
}


observer.observe(document.querySelector('body'), {
    childList: true,
    subtree: true
});

async function shouldConfirmManyTabs() {
    const storage = await browser.storage.local.get("suppressConfirm");
    return !storage.suppressConfirm;
}

async function shouldMarkRead() {
    const storage = await browser.storage.local.get("markRead");
    return storage.markRead;
}

async function open() {
    const unread = document.getElementsByClassName('entry--unread');

    if (unread.length >= 5 && await shouldConfirmManyTabs() && !confirm(`Are you sure you want to open ${unread.length} tabs`)) {
        return;
    }

    await Promise.all([...unread].map(x => browser.runtime.sendMessage({
        href: x.querySelector('a.entry__title').href
    })))

    if (await shouldMarkRead()) {
        const markAsReadDropdownTrigger = document.getElementsByClassName('MarkAsReadButton')[0];
        markAsReadDropdownTrigger.click();

        await new Promise(resolve => requestAnimationFrame(resolve));

        const markAllAsReadItem = markAsReadDropdownTrigger.parentElement.querySelector('li:nth-child(2)');
        markAllAsReadItem.click();
    }
}
