// Frontend JS for adding products dynamically
let productCount = 0;
function addProduct() {
  productCount++;
  const productsDiv = document.getElementById('products');
  const productHTML = `<div class="product-item">
    <input type="text" name="productName${productCount}" placeholder="Product Name" required>
    <input type="text" name="productCaption${productCount}" placeholder="Caption" required>
    <input type="number" name="productPrice${productCount}" placeholder="Price" required>
    <input type="file" name="productImage${productCount}" accept="image/*" required onchange="previewImage(event, ${productCount})">
    <img id="preview${productCount}" style="max-width:100px;display:none;margin-top:8px;" />
  </div>`;
  productsDiv.insertAdjacentHTML('beforeend', productHTML);
}

function previewImage(event, count) {
  const file = event.target.files[0];
  const preview = document.getElementById(`preview${count}`);
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }
}

document.getElementById('storeForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  // Collect product images
  const productDivs = document.querySelectorAll('.product-item');
  productDivs.forEach((div, i) => {
    const fileInput = div.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      formData.append('productImages', fileInput.files[0]);
    }
  });
  try {
    const res = await fetch('http://127.0.0.1:5000/api/stores', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      // Redirect to the new store page (user-friendly storefront)
      window.location.href = data.url;
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    alert('Failed to create store: ' + err.message);
  }
});
