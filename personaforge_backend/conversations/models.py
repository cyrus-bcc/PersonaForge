from django.db import models

class ConversationMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    conversation_id = models.CharField(max_length=100)
    message_seq = models.PositiveIntegerField()
    persona_id = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)  # auto timestamp if missing
    intent = models.CharField(max_length=100)
    channel = models.CharField(max_length=50)
    language = models.CharField(max_length=50)
    style_tags = models.CharField(max_length=255, blank=True, null=True)  # semicolon separated tags
    related_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    text = models.TextField()

    class Meta:
        db_table = "conversation_messages"
        ordering = ["conversation_id", "message_seq"]
        unique_together = ("conversation_id", "message_seq")

    def __str__(self):
        return f"{self.conversation_id} | {self.message_seq} | {self.role}"