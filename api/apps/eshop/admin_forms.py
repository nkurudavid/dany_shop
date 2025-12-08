from django import forms
from apps.eshop.models import ProductImage


class ProductImageAdminForm(forms.ModelForm):
    upload_image = forms.FileField(
        required=False,
        help_text="Upload an image. It will be converted and stored."
    )

    class Meta:
        model = ProductImage
        fields = ['product', 'upload_image']

    def save(self, commit=True):
        instance = super().save(commit=False)

        file = self.cleaned_data.get("upload_image")
        if file:
            instance.file_name = file.name
            instance.mime_type = getattr(file, "content_type", "application/octet-stream")
            instance.image_data = file.read()

        if commit:
            instance.save()
        return instance





class ProductImageForm(forms.ModelForm):
    upload = forms.FileField(
        required=False,
        help_text="Upload an image. It will be stored as binary."
    )

    class Meta:
        model = ProductImage
        fields = ['upload']  # Inline only needs upload

    def save(self, commit=True):
        instance = super().save(commit=False)

        file = self.cleaned_data.get("upload")
        if file:
            instance.file_name = file.name
            instance.mime_type = getattr(file, "content_type", "application/octet-stream")
            instance.image_data = file.read()

        if commit:
            instance.save()
        return instance
