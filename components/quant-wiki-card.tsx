"use client";
import React from "react";
import { Card, Tag } from "antd";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "@/src/css/quant-wiki.module.css";

interface QuantWikiCardProps {
  id: string;
  title: string;
  desc: string;
  image: string;
  tags: string[];
  difficulty: string;
}

const QuantWikiCard: React.FC<QuantWikiCardProps> = ({
  id,
  title,
  desc,
  image,
  tags,
  difficulty,
}) => {
  const t = useTranslations("quant-wiki");

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "green";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <Link href={`/quant-wiki/${id}`}>
      <Card
        hoverable
        className={styles.card}
        cover={
          <div className={styles.imageContainer}>
            <img alt={title} src={image} className={styles.image} />
          </div>
        }
      >
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{desc}</p>
          <div className={styles.tags}>
            <Tag color={getDifficultyColor(difficulty)}>
              {t(`difficulty.${difficulty}`)}
            </Tag>
            {tags.map((tag, index) => (
              <Tag key={index} color="gold">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default QuantWikiCard;
