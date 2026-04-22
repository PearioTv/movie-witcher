<style scoped lang="scss">
/* ... التنسيقات الأساسية ... */
.popup-container {
  &.cinema {
    max-width: 95%;
    width: 95%;
    height: auto;
    
    .popup-content {
      height: auto;
      padding: 0;
      background: #000;
      
      :deep(iframe) {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }
}

.popup-close {
  position: absolute;
  top: -50px; /* تحريك زر الإغلاق للأعلى لعدم التداخل مع المشغل */
  right: 0;
  /* ... باقي التنسيقات ... */
}

@media (max-width: 768px) {
  .popup-container.cinema {
    width: 100%;
    padding: 0 10px;
    .popup-close {
      top: -45px;
      right: 10px;
    }
  }
}
</style>
