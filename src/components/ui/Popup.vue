<style scoped lang="scss">
.popup-container.cinema {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;

  .popup-content {
    width: 100%;
    height: auto;
    border-radius: 0;
    background: #000;
    
    :deep(.vidfast-player-wrapper) {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .popup-container.cinema {
    padding: 0;
    .popup-close {
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
