// client/src/pages/admin/AdminTrajets.js
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Drawer,
  Space,
  message,
  List,
  Tag,
  Descriptions,
  Divider,
} from "antd";
import { RefreshCw, Search, ArrowUpDown } from "lucide-react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import smartApi from "../../utils/smartApi";
import dayjs from "dayjs";
import FormTrajet from "./FormTrajet";

const socket = io(
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  {
    transports: ["websocket"],
  }
);

const AdminTrajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    fetchTrajets();

    // 🔌 Écoute en temps réel des réservations
    socket.on("reservation_created", (data) => {
      message.info(
        `🚍 Réservation effectuée sur le trajet ${data.trajet?.villeDepart} → ${data.trajet?.villeArrivee}`
      );
      fetchTrajets(); // met à jour les places restantes
    });

    socket.on("reservation_deleted", (data) => {
      message.success(
        `🪑 Une réservation a été annulée — des places ont été libérées.`
      );
      fetchTrajets();
    });

    return () => {
      socket.off("reservation_created");
      socket.off("reservation_deleted");
    };
  }, []);

  // 🔄 Récupération des trajets depuis l’API
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const res = await smartApi.get("/trajets");
      setTrajets(res.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Erreur lors du chargement des trajets");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrajet = () => {
    setSelectedTrajet(null);
    setIsModalOpen(true);
  };

  const handleEditTrajet = (trajet) => {
    setSelectedTrajet({
      ...trajet,
      dateDepart: dayjs(trajet.dateDepart),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTrajet = async (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce trajet ?",
      okText: "Oui",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await smartApi.delete(`/trajets/${id}`);
          message.success("Trajet supprimé !");
          fetchTrajets();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const handleViewDetails = (trajet) => {
    setSelectedTrajet(trajet);
    setDrawerVisible(true);
  };

  const handleFormSubmit = async () => {
    setIsModalOpen(false);
    fetchTrajets();
  };

  // 🧾 Colonnes du tableau
  const columns = [
    {
      title: "Départ",
      dataIndex: "villeDepart",
      key: "villeDepart",
    },
    {
      title: "Arrivée",
      dataIndex: "villeArrivee",
      key: "villeArrivee",
    },
    {
      title: "Date de départ",
      dataIndex: "dateDepart",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Heure départ",
      dataIndex: "heureDepart",
    },
    {
      title: "Prix principal",
      dataIndex: "prix",
      render: (text) => `${text} FCFA`,
    },
    {
      title: "Places",
      dataIndex: "nombrePlaces",
    },
    {
      title: "Places restantes",
      dataIndex: "placesRestantes",
      render: (text, record) => {
        const restantes = record.placesRestantes ?? record.nombrePlaces;
        let color = "green";
        if (restantes <= 5) color = "orange";
        if (restantes === 0) color = "red";

        return (
          <Tag color={color} style={{ fontWeight: "bold" }}>
            {restantes}
          </Tag>
        );
      },
    },
    {
      title: "Segments",
      dataIndex: "segments",
      render: (segments) =>
        segments && segments.length > 0 ? (
          <Tag color="blue">{segments.length} segment(s)</Tag>
        ) : (
          <Tag color="default">Aucun</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Détails
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTrajet(record)}
          >
            Modifier
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTrajet(record._id)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 🔹 En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Liste des trajets
        </h2>

        <div className="flex flex-wrap gap-3 items-center">
          {/* 🔍 Recherche */}
          <div className="flex items-center gap-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
            <Search className="text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par ville ou par date ..."
              className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 🔽 Tri */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200"
            >
              <option value="recent">📅 Plus récents</option>
              <option value="depart">🔤 Par ville de départ</option>
              <option value="arrivee">🔤 Par ville d'arrivée</option>
            </select>
          </div>

          {/* 🔁 Actualiser */}
          <button
            onClick={fetchTrajets}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </div>

      {/* 🧱 Tableau principal */}
      <Card
        title={
          <span>
            <CarOutlined style={{ marginRight: 8 }} />
            Gestion des Trajets
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTrajet}
          >
            Ajouter Trajet
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={trajets}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* 🟢 Modal Ajout / Édition */}
      <Modal
        title={selectedTrajet ? "Modifier un trajet" : "Ajouter un trajet"}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <FormTrajet
          trajet={selectedTrajet}
          onSuccess={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* 🟦 Drawer Détails du trajet */}
      {/* 🟦 Drawer Détails du trajet */}
      <Drawer
        title={
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {selectedTrajet?.villeDepart} → {selectedTrajet?.villeArrivee}
            </span>
            <span className="text-sm text-gray-500">
              {dayjs(selectedTrajet?.dateDepart).format("DD MMM YYYY")} —{" "}
              {selectedTrajet?.heureDepart} à{" "}
              {selectedTrajet?.heureArrivee || "?"}
            </span>
          </div>
        }
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ backgroundColor: "#fafafa", paddingBottom: 80 }}
      >
        {selectedTrajet ? (
          <>
            {/* 📋 Informations principales */}
            <Card
              bordered={false}
              className="shadow-sm mb-5 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <Descriptions
                column={1}
                bordered
                size="small"
                labelStyle={{ fontWeight: "bold", width: "40%" }}
              >
                <Descriptions.Item label="🚌 Compagnie">
                  {selectedTrajet.compagnie}
                </Descriptions.Item>

                <Descriptions.Item label="🚗 Type de véhicule">
                  {selectedTrajet.typeVehicule}
                </Descriptions.Item>

                <Descriptions.Item label="💰 Prix principal">
                  <Tag color="blue">{selectedTrajet.prix} FCFA</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="💺 Nombre de places">
                  {selectedTrajet.nombrePlaces}
                </Descriptions.Item>

                <Descriptions.Item label="🎟️ Places restantes">
                  <Tag
                    color={
                      selectedTrajet.placesRestantes === 0
                        ? "red"
                        : selectedTrajet.placesRestantes <= 5
                        ? "orange"
                        : "green"
                    }
                    style={{ fontWeight: "bold" }}
                  >
                    {selectedTrajet.placesRestantes ??
                      selectedTrajet.nombrePlaces}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="📅 Statut">
                  {selectedTrajet.actif ? (
                    <Tag color="green">Actif</Tag>
                  ) : (
                    <Tag color="red">Inactif</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 🛣️ Timeline des segments */}
            <Divider
              orientation="left"
              orientationMargin="0"
              className="text-gray-600"
            >
              🛣️ Segments du trajet
            </Divider>

            {selectedTrajet.segments?.length > 0 ? (
              <div className="relative border-l-2 border-blue-500 pl-5 ml-3 space-y-4">
                {selectedTrajet.segments.map((seg, index) => (
                  <div
                    key={index}
                    className="relative bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                  >
                    {/* Point bleu timeline */}
                    <div className="absolute -left-3 top-4 w-3 h-3 bg-blue-500 rounded-full"></div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {seg.depart} → {seg.arrivee}
                      </span>
                      <span className="text-sm text-gray-500">
                        Prix : <Tag color="green">{seg.prix} FCFA</Tag>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center italic mt-3">
                Aucun segment défini pour ce trajet.
              </p>
            )}

            <Divider />

            {/* 🕓 Infos supplémentaires */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                🕒 Créé le :{" "}
                <b>
                  {dayjs(selectedTrajet.createdAt).format("DD MMM YYYY HH:mm")}
                </b>
              </p>
              <p>
                🔁 Dernière mise à jour :{" "}
                <b>
                  {dayjs(selectedTrajet.updatedAt).format("DD MMM YYYY HH:mm")}
                </b>
              </p>
            </div>

            <Divider />

            {/* ✏️ Bouton d’action rapide */}
            <Button
              type="primary"
              icon={<EditOutlined />}
              block
              onClick={() => {
                setDrawerVisible(false);
                handleEditTrajet(selectedTrajet);
              }}
            >
              Modifier ce trajet
            </Button>
          </>
        ) : (
          <p className="text-gray-500 text-center">Aucun trajet sélectionné.</p>
        )}
      </Drawer>
    </div>
  );
};

export default AdminTrajets;
