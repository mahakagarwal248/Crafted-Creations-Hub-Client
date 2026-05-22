import { useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { addReview } from '../APIs/reviewApi';
import './ReviewModal.css';

function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="review-modal-stars" role="radiogroup" aria-label="Rating">
      {stars.map((s) => {
        const filled = (hover || value) >= s;
        return (
          <button
            key={s}
            type="button"
            className={`review-modal-star ${filled ? 'review-modal-star--filled' : ''}`}
            onMouseEnter={() => !disabled && setHover(s)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange(s)}
            disabled={disabled}
            aria-label={`${s} star${s > 1 ? 's' : ''}`}
            role="radio"
            aria-checked={value === s}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

function ReviewModal({ show, onHide, item, order, user, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setRating(0);
      setComment('');
      setPhotoUrl('');
      setPhotoError('');
      setError('');
      setSubmitting(false);
    }
  }, [show, item?.productId, order?._id]);

  const handlePhotoChange = async (e) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Image must be 4 MB or smaller.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setPhotoUrl(typeof dataUrl === 'string' ? dataUrl : '');
    } catch {
      setPhotoError('Could not read the selected file.');
    }
  };

  const clearPhoto = () => {
    setPhotoUrl('');
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id || !order?._id || !item?.productId) return;
    if (rating < 1) {
      setError('Please pick a rating.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const response = await addReview({
        productId: item.productId,
        userId: user._id,
        orderId: order._id,
        rating,
        comment,
        photoUrl,
      });
      if (response?.status === 201 && response.data?.data) {
        onSubmitted?.(response.data.data);
        onHide?.();
      } else {
        setError(response?.data?.message || 'Could not submit review.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" dialogClassName="review-modal-dialog">
      <Modal.Header closeButton closeVariant="white" className="review-modal-header">
        <Modal.Title className="review-modal-title">Write a review</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="review-modal-body">
          <p className="review-modal-product">
            For <strong>{item?.name}</strong>
          </p>

          <Form.Group className="mb-3">
            <Form.Label className="review-modal-label">Your rating</Form.Label>
            <StarPicker value={rating} onChange={setRating} disabled={submitting} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="review-modal-label">Your review</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love? Anything to mention?"
              disabled={submitting}
              maxLength={1500}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="review-modal-label">Photo (optional)</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={submitting}
            />
            <Form.Text className="review-modal-hint">PNG/JPG, up to 4 MB. We'll use a default avatar if none.</Form.Text>
            {photoError && <p className="review-modal-error mt-2 mb-0">{photoError}</p>}
            {photoUrl && (
              <div className="review-modal-photo-preview">
                <img src={photoUrl} alt="Review preview" />
                <button
                  type="button"
                  className="review-modal-photo-remove"
                  onClick={clearPhoto}
                  disabled={submitting}
                >
                  Remove
                </button>
              </div>
            )}
          </Form.Group>

          {error && <p className="review-modal-error mb-0">{error}</p>}
        </Modal.Body>
        <Modal.Footer className="review-modal-footer">
          <Button variant="outline-light" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit review'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ReviewModal;
