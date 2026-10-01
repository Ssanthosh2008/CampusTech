import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config.js";

const PAGE_SIZE = 20;
const supabase = createClient(supabaseUrl, supabasePublishableKey);
const $ = (selector) => document.querySelector(selector);
const elements = {
  authGate: $("#auth-gate"), appContent: $("#app-content"), signIn: $("#sign-in-button"), gateSignIn: $("#gate-sign-in-button"),
  signOut: $("#sign-out-button"), userLabel: $("#user-label"), message: $("#message"), postPanel: $("#post-panel"),
  form: $("#item-form"), newPost: $("#new-post-button"), closePost: $("#close-post-button"), cancelPost: $("#cancel-post-button"),
  imageFile: $("#image-file"), imageNote: $("#image-note"), search: $("#search-input"), typeFilter: $("#type-filter"),
  categoryFilter: $("#category-filter"), statusFilter: $("#status-filter"), itemsList: $("#items-list"), emptyItems: $("#empty-items"),
  resultCount: $("#result-count"), loadMore: $("#load-more-button"), returnPanel: $("#return-panel"), returnForm: $("#return-form"),
  returnTitle: $("#return-item-title"), closeReturn: $("#close-return-button"), cancelReturn: $("#cancel-return-button")
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
  elements.authGate.hidden = signedIn; elements.appContent.hidden = !signedIn; elements.signIn.hidden = signedIn;
  elements.signOut.hidden = !signedIn; elements.userLabel.hidden = !signedIn;
  elements.userLabel.textContent = signedIn ? (user.user_metadata?.full_name || user.email) : "";
}
async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  if (error) showMessage(error.message || "Sign-in failed. Please try again.", true);
}
function closePostForm() { elements.postPanel.hidden = true; elements.form.reset(); elements.imageNote.textContent = "No image selected."; }
function closeReturnForm() { elements.returnPanel.hidden = true; elements.returnForm.reset(); }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function formatDate(value) { if (!value) return "Not set"; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString(undefined, { dateStyle: "medium" }); }
function formatPostedAt(value) { if (!value) return "Just now"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
function filteredItems() {
  const search = elements.search.value.trim().toLowerCase(); const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value; const status = elements.statusFilter.value;
  return allItems.filter((item) => (!search || item.title.toLowerCase().includes(search)) && (type === "all" || item.type === type) && (category === "all" || item.category === category) && (status === "all" || item.status === status));
}
function returnDetailsMarkup(item, isOwner) {
  const record = item.returns?.[0];
  if (!record || !isOwner) return "";
  return `<div class="return-details"><strong>Return recorded</strong><br>To ${escapeHtml(record.returned_to_name)} on ${escapeHtml(formatDate(record.returned_on))}${record.handover_location ? ` · ${escapeHtml(record.handover_location)}` : ""}${record.verification_notes ? `<br>${escapeHtml(record.verification_notes)}` : ""}</div>`;
}
function renderItems() {
  const items = filteredItems(); elements.resultCount.textContent = `${items.length} ${items.length === 1 ? "post" : "posts"}`; elements.emptyItems.hidden = items.length !== 0;
  elements.itemsList.innerHTML = items.map((item) => {
    const isOwner = currentUser?.id === item.user_id; const statusBadge = item.status === "returned" ? '<span class="badge badge-returned">Returned</span>' : '<span class="badge">Open</span>';
    const image = item.image_url ? `<img class="item-image" src="${escapeHtml(item.image_url)}" alt="" loading="lazy">` : "";
    const action = item.status === "open" && isOwner ? `<button class="button button-secondary" data-action="return" data-id="${item.id}">Mark as Returned</button>` : "";
    return `<article class="item-card">${image}<div class="item-body"><div class="item-meta"><span class="badge badge-${escapeHtml(item.type)}">${escapeHtml(item.type)}</span><span class="badge">${escapeHtml(item.category)}</span>${statusBadge}</div><h3>${escapeHtml(item.title)}</h3><p class="item-description">${escapeHtml(item.description || "No description provided.")}</p><div class="item-details"><span><strong>Where:</strong> ${escapeHtml(item.location || "Not provided")}</span><span><strong>When:</strong> ${escapeHtml(formatDate(item.item_date))}</span><span><strong>Contact:</strong> ${escapeHtml(item.contact || "Not provided")}</span><span>Posted ${escapeHtml(formatPostedAt(item.created_at))}</span></div>${returnDetailsMarkup(item, isOwner)}${isOwner ? `<div class="item-actions">${action}<button class="button button-secondary danger-button" data-action="delete" data-id="${item.id}">Delete</button></div>` : ""}</div></article>`;
  }).join("");
  elements.loadMore.hidden = !hasMore || items.length === 0;
}
async function loadItems(reset = false) {
  if (reset) { page = 0; allItems = []; }
  const from = page * PAGE_SIZE; const { data, error } = await supabase.from("items").select("*, returns(*)").order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) return showMessage(`Could not load posts: ${error.message}`, true);
  allItems = reset ? data : [...allItems, ...data]; hasMore = data.length === PAGE_SIZE; page += 1; renderItems();
}
function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null); const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => { const image = new Image(); image.onerror = () => reject(new Error("That image format could not be processed.")); image.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.72; let data = canvas.toDataURL("image/jpeg", quality); while (data.length > 150 * 1024 * 1.37 && quality > 0.15) { quality -= 0.1; data = canvas.toDataURL("image/jpeg", quality); }
      if (data.length > 150 * 1024 * 1.37) return reject(new Error("Please choose a smaller image (under 150 KB after compression).")); resolve(data);
    }; image.src = reader.result; }; reader.readAsDataURL(file);
  });
}
async function uploadImage(file) {
  if (!file) return "";
  const dataUrl = await compressImage(file); const response = await fetch(dataUrl); const blob = await response.blob();
  const path = `${currentUser.id}/${crypto.randomUUID()}.jpg`; const { error } = await supabase.storage.from("item-images").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error; return supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
}
async function createItem(event) {
  event.preventDefault(); if (!currentUser) return; const formData = new FormData(elements.form); const imageFile = elements.imageFile.files[0]; const imageUrl = formData.get("imageUrl").trim();
  if (imageFile && imageUrl) return showMessage("Use an image URL or a file, not both.", true); const submitButton = elements.form.querySelector("[type=submit]"); submitButton.disabled = true;
  try { const imageUrlValue = imageFile ? await uploadImage(imageFile) : imageUrl; const { error } = await supabase.from("items").insert({ user_id: currentUser.id, type: formData.get("type"), title: formData.get("title").trim(), description: formData.get("description").trim() || null, category: formData.get("category"), location: formData.get("location").trim() || null, item_date: formData.get("itemDate") || null, contact: formData.get("contact").trim() || null, image_url: imageUrlValue || null }); if (error) throw error; closePostForm(); await loadItems(true); showMessage("Your post is live."); }
  catch (error) { showMessage(error.message || "Could not publish the post.", true); } finally { submitButton.disabled = false; }
}
function openReturnForm(item) { elements.returnForm.reset(); elements.returnForm.itemId.value = item.id; elements.returnForm.returnedOn.value = new Date().toISOString().slice(0, 10); elements.returnTitle.textContent = `Return: ${item.title}`; elements.returnPanel.hidden = false; elements.returnForm.returnedToName.focus(); }
async function createReturn(event) {
  event.preventDefault(); if (!currentUser) return; const formData = new FormData(elements.returnForm); const submitButton = elements.returnForm.querySelector("[type=submit]"); submitButton.disabled = true;
  try { const { error } = await supabase.from("returns").insert({ item_id: formData.get("itemId"), recorded_by: currentUser.id, returned_to_name: formData.get("returnedToName").trim(), returned_to_contact: formData.get("returnedToContact").trim() || null, returned_on: formData.get("returnedOn"), handover_location: formData.get("handoverLocation").trim() || null, verification_notes: formData.get("verificationNotes").trim() || null }); if (error) throw error; closeReturnForm(); await loadItems(true); showMessage("Return details saved. The item is marked Returned."); }
  catch (error) { showMessage(error.message || "Could not save return details.", true); } finally { submitButton.disabled = false; }
}
async function handleItemAction(event) {
  const button = event.target.closest("[data-action]"); if (!button) return; const item = allItems.find((candidate) => candidate.id === button.dataset.id);
  if (!item || item.user_id !== currentUser?.id) return showMessage("You can only manage your own posts.", true);
  if (button.dataset.action === "return") return openReturnForm(item); if (!window.confirm("Delete this post?")) return;
  const { error } = await supabase.from("items").delete().eq("id", item.id); if (error) return showMessage(error.message || "Could not delete that post.", true); await loadItems(true); showMessage("Post deleted.");
}
async function applySession(session) {
  const user = session?.user || null;
  setSignedInUI(user); if (user) { showMessage(""); await loadItems(true); }
}
elements.signIn.addEventListener("click", signIn); elements.gateSignIn.addEventListener("click", signIn); elements.signOut.addEventListener("click", () => supabase.auth.signOut());
elements.newPost.addEventListener("click", () => { elements.postPanel.hidden = false; elements.form.querySelector("[name=title]").focus(); }); elements.closePost.addEventListener("click", closePostForm); elements.cancelPost.addEventListener("click", closePostForm);
elements.form.addEventListener("submit", createItem); elements.returnForm.addEventListener("submit", createReturn); elements.closeReturn.addEventListener("click", closeReturnForm); elements.cancelReturn.addEventListener("click", closeReturnForm); elements.itemsList.addEventListener("click", handleItemAction);
elements.loadMore.addEventListener("click", () => loadItems(false)); [elements.search, elements.typeFilter, elements.categoryFilter, elements.statusFilter].forEach((control) => control.addEventListener("input", renderItems));
elements.imageFile.addEventListener("change", () => { elements.imageNote.textContent = elements.imageFile.files[0] ? "Image will be compressed and uploaded under 150 KB." : "No image selected."; });
supabase.auth.onAuthStateChange((_event, session) => { void applySession(session); });
const { data: { session } } = await supabase.auth.getSession(); await applySession(session);
