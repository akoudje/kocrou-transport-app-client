import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Divider,
  message,
  Card,
  Row,
  Col,
  Select,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../utils/api";
import Swal from "sweetalert2";

const VEHICULE_TYPES = [
  { label: "Autocar", value: "autocar" },
  { label: "Minibus", value: "minibus" },
  { label: "Bus VIP", value: "bus VIP" },
  { label: "Autre", value: "autre" },
];

const FormTrajet = ({ trajet, onSuccess, onCancel }) => {
  const [form] = Form.useForm();

  // ✅ Préremplissage si édition
  useEffect(() => {
    if (trajet) {
      const safeDate = (d) => {
        try {
          const parsed = dayjs(d);
          return parsed.isValid() ? parsed : null;
        } catch {
          return null;
        }
      };

      form.setFieldsValue({
        ...trajet,
        dateDepart: safeDate(trajet.dateDepart),
        heureDepart: trajet.heureDepart
          ? dayjs(trajet.heureDepart, "HH:mm")
          : null,
        heureArrivee: trajet.heureArrivee
          ? dayjs(trajet.heureArrivee, "HH:mm")
          : null,
        segments: trajet.segments || [],
      });
    } else {
      form.resetFields();
    }
  }, [trajet, form]);

  // ✅ Vérification doublon
  const checkDuplicateTrajet = async (values) => {
    try {
      const { data } = await api.get("/trajets");
      const existing = data.data || [];

      return existing.find((t) => {
        return (
          t.villeDepart.toLowerCase() === values.villeDepart.toLowerCase() &&
          t.villeArrivee.toLowerCase() === values.villeArrivee.toLowerCase() &&
          dayjs(t.dateDepart).isSame(values.dateDepart, "day") &&
          (!trajet || t._id !== trajet._id)
        );
      });
    } catch (err) {
      console.error("⚠️ Erreur vérification doublon :", err);
      return false;
    }
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        dateDepart: values.dateDepart
          ? values.dateDepart.format("YYYY-MM-DD")
          : null,
        heureDepart: values.heureDepart
          ? values.heureDepart.format("HH:mm")
          : null,
        heureArrivee: values.heureArrivee
          ? values.heureArrivee.format("HH:mm")
          : null,
        typeVehicule: values.typeVehicule?.toLowerCase(),
      };

      // 🔍 Vérif doublon
      const duplicate = await checkDuplicateTrajet(values);
      if (duplicate) {
        Swal.fire({
          icon: "warning",
          title: "Trajet déjà existant 🚫",
          text: `Un trajet ${duplicate.villeDepart} → ${
            duplicate.villeArrivee
          } prévu le ${dayjs(duplicate.dateDepart).format(
            "DD/MM/YYYY"
          )} existe déjà.`,
          confirmButtonColor: "#d33",
        });
        return;
      }

      // 🧾 Récapitulatif avant enregistrement
      const recapSegments =
        values.segments && values.segments.length > 0
          ? values.segments
              .map(
                (seg, idx) => `
          <li>
            ${idx + 1}. ${seg.depart} → ${seg.arrivee} — <strong>${
                  seg.prix
                } FCFA</strong>
          </li>`
              )
              .join("")
          : "<em>Aucun segment défini</em>";

      const recap = `
  <div style="text-align:left; line-height:1.6;">
    <strong>Compagnie :</strong> ${values.compagnie}<br/>
    <strong>Trajet :</strong> ${values.villeDepart} → ${
        values.villeArrivee
      }<br/>
    <strong>Date :</strong> ${dayjs(values.dateDepart).format(
      "DD/MM/YYYY"
    )}<br/>
    <strong>Heure départ :</strong> ${
      values.heureDepart?.format("HH:mm") || "—"
    }<br/>
    <strong>Type de véhicule :</strong> ${values.typeVehicule}<br/>
    <strong>Prix principal :</strong> ${values.prix} FCFA<br/>
    <strong>Places :</strong> ${values.nombrePlaces}<br/><br/>
    <strong>🧩 Segments :</strong>
    <ul style="margin-top:6px; padding-left:18px;">
      ${recapSegments}
    </ul>
  </div>
`;

      const confirmation = await Swal.fire({
        title: trajet
          ? "Confirmer la modification ?"
          : "Confirmer l’ajout du trajet ?",
        html: recap,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: trajet ? "Mettre à jour" : "Ajouter",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#d33",
      });

      if (!confirmation.isConfirmed) return;

      // 🔥 Envoi au backend
      if (trajet?._id) {
        await api.put(`/trajets/${trajet._id}`, payload);
        message.success("Trajet mis à jour avec succès 🚍");
      } else {
        await api.post("/trajets", payload);
        message.success("Nouveau trajet ajouté ✅");
      }

      onSuccess?.();
    } catch (error) {
      console.error(
        "❌ Erreur sauvegarde trajet :",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Erreur serveur",
        text:
          error.response?.data?.message ||
          "Impossible d’enregistrer le trajet. Vérifiez vos données et réessayez.",
      });
    }
  };

  return (
    <Card
      bordered={false}
      className="shadow-md rounded-xl p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-2"
      >
        {/* 🏙️ Première ligne */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ville de départ"
              name="villeDepart"
              rules={[{ required: true, message: "Ville de départ requise" }]}
            >
              <Input placeholder="Ex: Abidjan" className="h-10" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ville d’arrivée"
              name="villeArrivee"
              rules={[{ required: true, message: "Ville d’arrivée requise" }]}
            >
              <Input placeholder="Ex: Bouaké" className="h-10" />
            </Form.Item>
          </Col>
        </Row>

        {/* 🚍 Infos générales */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Compagnie"
              name="compagnie"
              rules={[
                { required: true, message: "Nom de la compagnie requis" },
              ]}
            >
              <Input placeholder="Ex: Kocrou Transport" className="h-10" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Type de véhicule"
              name="typeVehicule"
              rules={[{ required: true, message: "Type de véhicule requis" }]}
            >
              <Select
                options={VEHICULE_TYPES}
                placeholder="Choisir un type"
                className="h-10"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Prix principal (FCFA)"
              name="prix"
              rules={[{ required: true, message: "Prix requis" }]}
            >
              <InputNumber min={100} className="w-full h-10" />
            </Form.Item>
          </Col>
        </Row>

        {/* 📅 Horaires */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Date de départ"
              name="dateDepart"
              rules={[{ required: true, message: "Date de départ requise" }]}
            >
              <DatePicker format="DD/MM/YYYY" className="w-full h-10" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Heure de départ"
              name="heureDepart"
              rules={[{ required: true, message: "Heure de départ requise" }]}
            >
              <TimePicker format="HH:mm" className="w-full h-10" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Heure d’arrivée" name="heureArrivee">
              <TimePicker format="HH:mm" className="w-full h-10" />
            </Form.Item>
          </Col>
        </Row>

        {/* 🚏 Places */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre total de places"
              name="nombrePlaces"
              rules={[{ required: true, message: "Nombre de places requis" }]}
            >
              <InputNumber min={1} max={100} className="w-full h-10" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">🧩 Segments du trajet</Divider>

        <Form.List name="segments">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: "flex",
                    marginBottom: 8,
                    justifyContent: "space-between",
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "depart"]}
                    rules={[{ required: true, message: "Départ requis" }]}
                  >
                    <Input placeholder="Départ" className="h-10" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "arrivee"]}
                    rules={[{ required: true, message: "Arrivée requise" }]}
                  >
                    <Input placeholder="Arrivée" className="h-10" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "prix"]}
                    rules={[{ required: true, message: "Prix requis" }]}
                  >
                    <InputNumber
                      min={100}
                      placeholder="Prix (FCFA)"
                      className="h-10"
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="h-10"
                >
                  Ajouter un segment
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider />

        {/* 🔘 Actions */}
        <Space className="flex justify-end w-full">
          <Button onClick={onCancel} className="h-10">
            Annuler
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            className="bg-primary hover:bg-primary/90 h-10"
          >
            Enregistrer
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default FormTrajet;
