from PIL import Image
import os
import sys

def apply_watermark(input_image_path, watermark_image_path, output_image_path, position="bottom-right", padding=20):
    """
    Applies a transparent watermark logo to the specified image corner.
    """
    print(f"Applying watermark to {input_image_path}...")
    try:
        base_image = Image.open(input_image_path).convert("RGBA")
        watermark = Image.open(watermark_image_path).convert("RGBA")

        # Resize watermark to be proportional to the image (e.g., 20% of width)
        base_width, base_height = base_image.size
        wm_width, wm_height = watermark.size
        
        target_wm_width = int(base_width * 0.20)
        ratio = target_wm_width / wm_width
        target_wm_height = int(wm_height * ratio)
        
        watermark = watermark.resize((target_wm_width, target_wm_height), Image.Resampling.LANCZOS)
        
        # Calculate placing coordinate
        if position == "bottom-right":
            x = base_width - target_wm_width - padding
            y = base_height - target_wm_height - padding
        elif position == "bottom-left":
            x = padding
            y = base_height - target_wm_height - padding
        elif position == "top-right":
            x = base_width - target_wm_width - padding
            y = padding
        elif position == "top-left":
            x = padding
            y = padding
        else:
            x, y = padding, padding # fallback

        # Paste the watermark with alpha composite
        base_image.paste(watermark, (x, y), watermark)
        
        # Save output
        out_img = base_image.convert("RGB") # Drop alpha to save as standard JPEG/PNG
        out_img.save(output_image_path)
        print(f"✅ Watermarked image saved to {output_image_path}")
        return True

    except Exception as e:
        print(f"❌ Failed to apply watermark: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python watermark_image.py <input.jpg> <watermark.png> <output.jpg> [position]")
        sys.exit(1)
        
    pos = sys.argv[4] if len(sys.argv) > 4 else "bottom-right"
    apply_watermark(sys.argv[1], sys.argv[2], sys.argv[3], position=pos)
