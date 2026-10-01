import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { ALLOWED_EMAIL_DOMAIN, supabasePublishableKey, supabaseUrl } from "./supabase-config.js";

const PAGE_SIZE = 20;
const supabase = createClient(supabaseUrl, supabasePublishableKey);
const $ = (selector) => document.querySelector(selector);
const elements = {
  authGate: $("#auth-gate"), appContent: $("#app-content"), signIn: $("#sign-in-button"),
  gateSignIn: $("#gate-sign-in-button"), signOut: $("#sign-out-button"), userLabel: $("#user-label"),
  message: $("#message"), postPanel: $("#post-panel"), form: $("#item-form"), newPost: $("#new-post-button"),
  closePost: $("#close-post-button"), cancelPost: $("#cancel-post-button"), imageFile: $("#image-file"),
  imageNote: $("#image-note"), search: $("#search-input"), typeFilter: $("#type-filter"),
  categoryFilter: $("#category-filter"), itemsList: $("#items-list"), emptyItems: $("#empty-items"),
  resultCount: $("#result-count"), loadMore: $("#load-more-button")
};
let currentUser = null;
let allItems = [];
let page = 0;
let hasMore = false;

function showMessage(text, isError = false) {
  elements.message.textContent = text;
  elements.message.classList.toggle("error", isError);
  elements.message.hidden = !text;
}

function setSignedInUI(user) {
  currentUser = user;
  const signedIn = Boolean(user);
  elements.authGate.hidden = signedIn;
  elements.appContent.hidden = !signedIn;
  elements.signIn.hidden = signedIn;
  elements.signOut.hidden = !signedIn;
  elements.userLabel.hidden = !signedIn;
  elements.userLabel.textContent = signedIn ? (user.user_metadata?.full_name || user.email) : "";
}

async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin }
  });
  if (error) showMessage(error.message || "Sign-in failed. Please try again.", true);
}

function closePostForm() {
  elements.postPanel.hidden = true;
  elements.form.reset();
  elements.imageNote.textContent = "No image selected.";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function formatDate(value) {
  if (!value) return "Date not set";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatPostedAt(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function filteredItems() {
  const search = elements.search.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;
  return allItems.filter((item) => (!search || item.title.toLowerCase().includes(search)) &&
    (type === "all" || item.type === type) && (category === "all" || item.category === category));
}

function renderItems() {
  const items = filteredItems();
  elements.resultCount.textContent = `${items.length} ${items.length === 1 ? "post" : "posts"}`;
  elements.emptyItems.hidden = items.length !== 0;
  elements.itemsList.innerHTML = items.map((item) => {
    const isOwner = currentUser?.id === item.user_id;
    const statusBadge = item.status === "resolved" ? '<span class="badge badge-resolved">Resolved</span>' : "";
    const image = item.image_data ? `<img class="item-image" src="${escapeHtml(item.image_data)}" alt="" loading="lazy">` : "";
    return `<article class="item-card">${image}<div class="item-body">
      <div class="item-meta"><span class="badge badge-${escapeHtml(item.type)}">${escapeHtml(item.type)}</span><span class="badge">${escapeHtml(item.category)}</span>${statusBadge}</div>
      <h3>${escapeHtml(item.title)}</h3><p class="item-description">${escapeHtml(item.description)}</p>
      <div class="item-details"><span><strong>Where:</strong> ${escapeHtml(item.location)}</span><span><strong>When:</strong> ${escapeHtml(formatDate(item.date))}</span><span><strong>Contact:</strong> ${escapeHtml(item.contact)}</span><span>Posted ${escapeHtml(formatPostedAt(item.created_at))} by ${escapeHtml(item.user_name || "a student")}</span></div>
      ${isOwner ? `<div class="item-actions">${item.status === "open" ? `<button class="button button-secondary" data-action="resolve" data-id="${item.id}">Mark resolved</button>` : ""}<button class="button button-secondary danger-button" data-action="delete" data-id="${item.id}">Delete</button></div>` : ""}
    </div></article>`;
  }).join("");
  elements.loadMore.hidden = !hasMore || items.length === 0;
}

async function loadItems(reset = false) {
  if (reset) { page = 0; allItems = []; }
  const from = page * PAGE_SIZE;
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) return showMessage(`Could not load posts: ${error.message}`, true);
  allItems = reset ? data : [...allItems, ...data];
  hasMore = data.length === PAGE_SIZE;
  page += 1;
  renderItems();
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That image format could not be processed."));
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.7;
        let data = canvas.toDataURL("image/jpeg", quality);
        while (data.length > 100 * 1024 * 1.37 && quality > 0.2) { quality -= 0.1; data = canvas.toDataURL("image/jpeg", quality); }
        if (data.length > 100 * 1024 * 1.37) return reject(new Error("Please choose a smaller image (under 100 KB after compression)."));
        resolve(data);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function createItem(event) {
  event.preventDefault();
  if (!currentUser) return;
  const formData = new FormData(elements.form);
  const imageFile = elements.imageFile.files[0];
  const imageUrl = formData.get("imageUrl").trim();
  if (imageFile && imageUrl) return showMessage("Use an image URL or a file, not both.", true);
  const submitButton = elements.form.querySelector("[type=submit]");
  submitButton.disabled = true;
  try {
    const imageData = imageFile ? await compressImage(imageFile) : imageUrl;
    const { error } = await supabase.from("items").insert({
      type: formData.get("type"), title: formData.get("title").trim(), description: formData.get("description").trim(),
      category: formData.get("category"), location: formData.get("location").trim(), date: formData.get("date"),
      contact: formData.get("contact").trim(), image_data: imageData, user_id: currentUser.id,
      user_name: currentUser.user_metadata?.full_name || currentUser.email, status: "open"
    });
    if (error) throw error;
    closePostForm(); await loadItems(true); showMessage("Your post is live.");
  } catch (error) { showMessage(error.message || "Could not publish the post.", true); }
  finally { submitButton.disabled = false; }
}

async function handleItemAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const item = allItems.find((candidate) => candidate.id === button.dataset.id);
  if (!item || item.user_id !== currentUser?.id) return showMessage("You can only manage your own posts.", true);
  if (button.dataset.action === "delete" && !window.confirm("Delete this post?")) return;
  const update = button.dataset.action === "resolve"
    ? supabase.from("items").update({ status: "resolved" }).eq("id", item.id)
    : supabase.from("items").delete().eq("id", item.id);
  const { error } = await update;
  if (error) return showMessage(error.message || "Could not update that post.", true);
  await loadItems(true);
  showMessage(button.dataset.action === "resolve" ? "Post marked as resolved." : "Post deleted.");
}

async function applySession(session) {
  const user = session?.user || null;
  if (user && !user.email?.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN.toLowerCase()}`)) {
    await supabase.auth.signOut();
    setSignedInUI(null);
    showMessage(`Please use your college email ending in @${ALLOWED_EMAIL_DOMAIN}.`, true);
    return;
  }
  setSignedInUI(user);
  if (user) { showMessage(""); await loadItems(true); }
}

elements.signIn.addEventListener("click", signIn);
elements.gateSignIn.addEventListener("click", signIn);
elements.signOut.addEventListener("click", () => supabase.auth.signOut());
elements.newPost.addEventListener("click", () => { elements.postPanel.hidden = false; elements.form.querySelector("[name=title]").focus(); });
elements.closePost.addEventListener("click", closePostForm);
elements.cancelPost.addEventListener("click", closePostForm);
elements.form.addEventListener("submit", createItem);
elements.itemsList.addEventListener("click", handleItemAction);
elements.loadMore.addEventListener("click", () => loadItems(false));
[elements.search, elements.typeFilter, elements.categoryFilter].forEach((control) => control.addEventListener("input", renderItems));
elements.imageFile.addEventListener("change", () => { elements.imageNote.textContent = elements.imageFile.files[0] ? "Image will be compressed locally before upload." : "No image selected."; });
supabase.auth.onAuthStateChange((_event, session) => { void applySession(session); });
const { data: { session } } = await supabase.auth.getSession();
await applySession(session);
