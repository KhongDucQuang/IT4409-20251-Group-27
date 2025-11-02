# import paho.mqtt.client as mqtt
# import base64
# import json

# # ==== Callback để debug ====
# def on_connect(client, userdata, flags, rc):
#     if rc == 0:
#         print("✅ Kết nối thành công đến HiveMQ Cloud!")
#     else:
#         print("❌ Kết nối thất bại. Mã lỗi:", rc)

# def on_publish(client, userdata, mid):
#     print("📤 Publish thành công!")

# def on_disconnect(client, userdata, rc):
#     print("🔌 Ngắt kết nối. Mã:", rc)

# # ==== Đọc ảnh ====
# with open("anh.jpg", "rb") as f:
#     img_base64 = base64.b64encode(f.read()).decode("utf-8")

# data = {
#     "name": "kien",
#     "image": img_base64
# }

# print("📦 Dữ liệu sẽ gửi:", {"name": data["name"], "image": data["image"][:60] + "..."})

# # ==== MQTT Client ====
# client = mqtt.Client()
# client.username_pw_set("mqttnkq", "Soict2025")  # đúng username/password trong HiveMQ Cloud

# client.tls_set()  # bật SSL
# client.on_connect = on_connect
# client.on_publish = on_publish
# client.on_disconnect = on_disconnect

# # ==== Kết nối & gửi ====
# client.connect("71e2c6502603479280eb36c1b5b12bfc.s1.eu.hivemq.cloud", 8883)
# client.loop_start()

# result = client.publish("face/register", json.dumps(data))
# result.wait_for_publish()

# client.loop_stop()
# client.disconnect()
