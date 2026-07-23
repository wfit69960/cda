const offers = {
  essential: { label: "Essentiel", amount: 2900 },
  complete: { label: "Complet", amount: 4900 },
  urgent: { label: "Prioritaire", amount: 7900 },
};

const isGithubDemo = document.documentElement.dataset.demo === "github";
const header = document.querySelector("[data-header]");
const form = document.querySelector("#quoteForm");
const fileInput = document.querySelector("#quoteFile");
const uploadZone = document.querySelector("[data-upload-zone]");
const fileList = document.querySelector("[data-file-list]");
const statusEl = document.querySelector("[data-form-status]");
const modal = document.querySelector("[data-modal]");
const modalMessage = document.querySelector("[data-modal-message]");
const modalClose = document.querySelector("[data-modal-close]");

const formatBytes = (bytes) => {
  if (!bytes) return "0 Ko";
  const units = ["o", "Ko", "Mo", "Go"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
};

const openModal = (message) => {
  modalMessage.textContent = message;
  modal.hidden = false;
};

const closeModal = () => {
  modal.hidden = true;
};

const refreshFiles = () => {
  fileList.innerHTML = "";
  Array.from(fileInput.files || []).forEach((file) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const size = document.createElement("span");
    name.textContent = file.name;
    size.textContent = formatBytes(file.size);
    item.append(name, size);
    fileList.appendChild(item);
  });
};

const buildPayload = () => {
  const data = new FormData(form);
  const offerId = data.get("offer");
  const quoteAmount = Number(data.get("quoteAmount") || 0);
  const files = Array.from(fileInput.files || []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));

  return {
    dossierId: `CDA-${Date.now().toString(36).toUpperCase()}`,
    offerId,
    offerLabel: offers[offerId].label,
    customer: {
      name: data.get("name")?.trim(),
      email: data.get("email")?.trim(),
      phone: data.get("phone")?.trim(),
      city: data.get("city")?.trim(),
    },
    vehicle: {
      label: data.get("vehicle")?.trim(),
      mileage: data.get("mileage"),
    },
    quote: {
      amount: quoteAmount,
      repairer: data.get("repairer")?.trim(),
      priority: data.get("priority"),
      message: data.get("message")?.trim(),
      files,
    },
    createdAt: new Date().toISOString(),
  };
};

const validateRequest = () => {
  const requiredFields = Array.from(form.querySelectorAll("[required]")).filter(
    (field) => field.type !== "file",
  );
  const invalid = requiredFields.find((field) => !field.value.trim() || !field.checkValidity());

  if (invalid) {
    invalid.focus();
    setStatus("Merci de compléter les champs indispensables avant paiement.", true);
    return false;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    setStatus("Merci de joindre au moins une page du devis.", true);
    return false;
  }

  return true;
};

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
});

fileInput.addEventListener("change", refreshFiles);

["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, () => {
    uploadZone.classList.remove("is-dragging");
  });
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  if (event.dataTransfer.files?.length) {
    fileInput.files = event.dataTransfer.files;
    refreshFiles();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  if (isGithubDemo) {
    openModal(
      "Démo visuelle uniquement : le formulaire n'envoie aucune donnée et aucun paiement n'est lancé.",
    );
    setStatus("Démo visuelle : parcours simulé, aucune action réelle effectuée.");
    return;
  }
});

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
