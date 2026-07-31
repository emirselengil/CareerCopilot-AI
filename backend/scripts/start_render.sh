#!/bin/sh
# Render'ın ücretsiz katmanı yalnızca tek bir Web Service içerir (ayrı ücretsiz
# Background Worker yok). Bu script, Celery worker'ı arka planda başlatıp
# ana süreç olarak uvicorn'u aynı container içinde çalıştırır.
#
# Not: Celery worker bu script tarafından izlenmiyor — çökerse Render bunu
# fark etmez (yalnızca uvicorn'un PORT'u dinlemesi kontrol edilir). Bootcamp
# demosu için kabul edilebilir bir basitleştirme; prod-grade bir kurulum için
# ayrı bir worker servisi (Railway/Render paid tier) tercih edilmelidir.

celery -A app.tasks.celery_app worker --loglevel=info --pool=solo &

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
